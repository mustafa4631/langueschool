"use client";

import { useGetStudentReviewsQuery } from "@/lib/features/users/userApi";

const getVideoId = (videoId?: string, youtubeUrl?: string) => {
    if (videoId?.trim()) return videoId.trim();
    if (!youtubeUrl) return "";

    try {
        const parsedUrl = new URL(youtubeUrl);
        if (parsedUrl.hostname.includes("youtu.be")) {
            return parsedUrl.pathname.replace("/", "");
        }

        if (parsedUrl.searchParams.get("v")) {
            return parsedUrl.searchParams.get("v") || "";
        }

        if (parsedUrl.pathname.includes("/shorts/")) {
            return parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0] || "";
        }
    } catch {
        return "";
    }

    return "";
};

export function StudentReviewsVideoSection() {
    const { data: studentReviewsData } = useGetStudentReviewsQuery({});
    const allStudentReviews = studentReviewsData?.results || [];

    const lessonReviews = allStudentReviews.filter((review) => review.type === "lesson");
    const thinkReviews = allStudentReviews.filter((review) => review.type === "think");

    return (
        <section className="mt-24 w-full space-y-16 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        Derslerimizden <span className="text-[#1a365d]">Kesitler</span>
                    </h2>
                </div>

                {lessonReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessonReviews.map((review) => {
                            const videoId = getVideoId(review.video_id, review.youtube_url);
                            if (!videoId) return null;

                            return (
                                <div
                                    key={review.id}
                                    className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                                >
                                    <div className="relative aspect-video w-full">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                            title={review.name || "Ders videosu"}
                                            className="h-full w-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                        Derslerimizden kesit videosu bulunamadı.
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        Öğrencilerimizin <span className="text-[#1a365d]">Düşünceleri</span>
                    </h2>
                </div>

                {thinkReviews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {thinkReviews.map((review) => {
                            const videoId = getVideoId(review.video_id, review.youtube_url);
                            if (!videoId) return null;

                            return (
                                <div
                                    key={review.id}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="relative aspect-9/16 w-full">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                            title={review.name || "Öğrenci yorumu videosu"}
                                            className="h-full w-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                        Öğrenci yorumu videosu bulunamadı.
                    </div>
                )}
            </div>
        </section>
    );
}
