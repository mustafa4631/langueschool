from rest_framework.permissions import IsAuthenticated
import cloudinary.uploader
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser


ALLOWED_MIME = {
    "image/jpeg", "image/png", "image/webp", 
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"
}
MAX_BYTES = 10 * 1024 * 1024

class CloudinaryUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        """
        Accepts:
          - single:  file=<file>
          - multiple: files=<file1>&files=<file2>...
        Optional:
          - folder: "products/1" etc.
        Returns:
          - results: [{url, public_id, width, height, bytes, format, original_filename}]
        """

        folder = (request.data.get("folder") or "").strip() or None

        single = request.FILES.get("file")
        multiple = request.FILES.getlist("files")

        files = []
        if single:
            files = [single]
        elif multiple:
            files = multiple

        if not files:
            return Response(
                {"status": 400, "message": "Dosya bulunamadı."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        out = []
        for f in files:
            ct = getattr(f, "content_type", None)
            if ct not in ALLOWED_MIME:
                return Response(
                    {"status": 400, "message": f"Geçersiz dosya tipi: {ct}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if getattr(f, "size", 0) > MAX_BYTES:
                return Response(
                    {"status": 400, "message": f"Dosya çok büyük: {f.size} bytes. Maksimum: {MAX_BYTES}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                res = cloudinary.uploader.upload(
                    f,
                    folder=folder,
                    resource_type="auto",
                    overwrite=False,
                    unique_filename=True,
                )
            except Exception as e:
                return Response(
                    {"status": 500, "detail": f"Cloudinary upload failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            out.append(
                {
                    "url": res.get("secure_url") or res.get("url"),
                    "public_id": res.get("public_id"),
                    "width": res.get("width"),
                    "height": res.get("height"),
                    "bytes": res.get("bytes"),
                    "format": res.get("format"),
                    "original_filename": res.get("original_filename"),
                }
            )

        return Response({"status": 200, "results": out}, status=status.HTTP_200_OK)
