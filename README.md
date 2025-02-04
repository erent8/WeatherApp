# WeatherApp 🌤️

Modern ve kullanıcı dostu bir hava durumu uygulaması. Tüm dünyaya ait şehirler için anlık ve 5 günlük hava durumu tahminlerini görüntüleyin.

## Özellikler ✨

- **Anlık Hava Durumu**: Seçilen şehir için detaylı hava durumu bilgisi
- **5 Günlük Tahmin**: Günlük ve saatlik hava durumu tahminleri
- **Konum Tespiti**: Otomatik konum tespiti ile bulunduğunuz yerin hava durumu
- **Favori Şehirler**: Sık kullandığınız şehirleri favorilere ekleme
- **Son Aramalar**: Son 5 aramanızı otomatik kaydetme
- **Şehir Önerileri**: Yazarken otomatik şehir önerileri
- **Tema Seçenekleri**: Aydınlık/Karanlık tema desteği
- **Birim Seçenekleri**: Sıcaklık (°C/°F) ve rüzgar hızı (km/s/knot) birimleri
- **Animasyonlar**: Hava durumuna göre özel animasyonlar
- **Responsive Tasarım**: Tüm cihazlara uyumlu arayüz

## Kullanılan Teknolojiler 🛠️

- HTML5
- CSS3
- JavaScript (ES6+)
- OpenWeatherMap API
- Chart.js (Grafik gösterimi için)
- Font Awesome (İkonlar için)

## Kurulum 📦

1. Projeyi klonlayın:
```bash
git clone https://github.com/erent8/WeatherApp.git
```

2. Proje dizinine gidin:
```bash
cd WeatherApp.git
```

3. `config.js` dosyası oluşturun ve OpenWeatherMap API anahtarınızı ekleyin:
```javascript
const config = {
    apiKey: 'YOUR_API_KEY',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    units: 'metric',
    lang: 'tr'
};
```

4. Bir web sunucusu ile projeyi çalıştırın (örneğin Live Server)

## Kullanım 💡

- Şehir adı yazarak arama yapın
- Konum butonuna tıklayarak mevcut konumunuzun hava durumunu görün
- Yıldız ikonuna tıklayarak şehirleri favorilere ekleyin
- Tema değiştirme butonu ile aydınlık/karanlık tema arasında geçiş yapın
- Ayarlar menüsünden birim tercihlerinizi değiştirin
- Tahmin kartlarına tıklayarak saatlik detayları görün

## Ekran Görüntüleri 📸

![Ekran görüntüsü 2025-02-05 005131](https://github.com/user-attachments/assets/fc572af9-3466-4c22-a839-d7b6a601489e)



## Katkıda Bulunma 🤝

1. Bu projeyi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: XYZ'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Pull Request oluşturun

## Lisans 📄

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim 📧

erenterzi@protonmail.com <br>
https://x.com/therenn8

---
⭐️ Bu projeyi beğendiyseniz yıldızlamayı unutmayın!
