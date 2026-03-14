from bs4 import BeautifulSoup

def scrape_google_reviews(html_content):
    reviews_data = []
    # Playwright ile uğraşmıyoruz, senin verdiğin HTML'i çorbaya çeviriyoruz
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Senin paylaştığın ana yorum class'ı: jftiEf
    elements = soup.find_all(class_='jftiEf')
    print(f"HTML içinde {len(elements)} yorum bulundu.")

    for el in elements:
        try:
            # İsim: d4r55
            name = el.find(class_='d4r55').get_text(strip=True) if el.find(class_='d4r55') else "Anonim"
            
            # Metin: wiI7pd
            text = el.find(class_='wiI7pd').get_text(strip=True) if el.find(class_='wiI7pd') else ""
            
            # Rating: aria-label="5 yıldız"
            rating = 5
            rating_el = el.find(attrs={"aria-label": True})
            if rating_el and "yıldız" in rating_el['aria-label']:
                rating = int(''.join(filter(str.isdigit, rating_el['aria-label']))[0])

            reviews_data.append({
                'author_name': name,
                'review_text': text,
                'rating': rating,
                'author_avatar_url': None,
                'review_date': "Güncel",
            })
        except Exception as e:
            continue
            
    return reviews_data