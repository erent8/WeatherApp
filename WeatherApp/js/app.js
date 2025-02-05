class WeatherApp {
    constructor() {
        // API bilgileri
        this.apiUrl = config.baseUrl;
        this.apiKey = config.apiKey;
        
        // DOM elementleri
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.themeSwitch = document.getElementById('themeSwitch');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        this.favoritesBtn = document.getElementById('favoritesBtn');
        this.favoritesModal = document.getElementById('favoritesModal');
        this.closeFavorites = document.getElementById('closeFavorites');
        this.locationBtn = document.getElementById('locationBtn');
        this.locationSuggestions = document.querySelector('.location-suggestions');
        
        // Veri depolama
        this.favoriteLocations = JSON.parse(localStorage.getItem('favoriteLocations') || '[]');
        this.recentLocations = JSON.parse(localStorage.getItem('recentLocations') || '[]');
        this.currentLocation = null;
        this.lastWeatherData = null;
        
        // Ayarlar
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.settings = {
            tempUnit: localStorage.getItem('tempUnit') === 'F' ? 'F' : 'C',
            windUnit: localStorage.getItem('windUnit') === 'kt' ? 'kt' : 'km/s',
            animations: localStorage.getItem('animations') !== 'false',
            autoLocation: localStorage.getItem('autoLocation') === 'true'
        };
        
        this.loadingState = false;
        
        // Başlangıç fonksiyonlarını çağır
        this.bindEvents();
        this.initTheme();
        this.initSettings();
        this.initLocationFeatures();

        // Başlangıçta karşılama ekranını göster
        this.displayWelcomeScreen();
    }

    bindEvents() {
        // Arama ve tema olayları
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.getWeather());
        } else {
            console.error('Arama butonu bulunamadı');
        }

        if (this.cityInput) {
            this.cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.getWeather();
                }
            });
            
            // Şehir giriş alanı değiştiğinde favori butonunu güncelle
            this.cityInput.addEventListener('input', () => {
                const cityName = this.cityInput.value.trim();
                if (cityName) {
                    this.updateFavoriteButton(cityName, 'TR');
                } else {
                    const favoriteBtn = document.getElementById('favoriteBtn');
                    if (favoriteBtn) {
                        favoriteBtn.style.display = 'none';
                    }
                }
                this.handleLocationInput();
            });
        } else {
            console.error('Şehir giriş alanı bulunamadı');
        }

        if (this.themeSwitch) {
            this.themeSwitch.addEventListener('click', () => this.toggleTheme());
        } else {
            console.error('Tema değiştirme butonu bulunamadı');
        }
        
        // Ayarlar menüsü olayları
        if (this.settingsBtn && this.settingsModal && this.closeSettings) {
            this.settingsBtn.addEventListener('click', () => {
                console.log('Ayarlar butonu tıklandı');
                this.openSettings();
            });
            
            this.closeSettings.addEventListener('click', () => {
                console.log('Ayarlar kapatma butonu tıklandı');
                this.closeSettingsModal();
            });
            
            this.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.settingsModal) {
                    this.closeSettingsModal();
                }
            });
        } else {
            console.error('Ayarlar butonları veya modal bulunamadı');
        }

        // Ayar değişikliklerini dinle
        const tempUnitToggle = document.getElementById('tempUnit');
        const windUnitToggle = document.getElementById('windUnit');
        const animationsToggle = document.getElementById('animations');
        const autoLocationToggle = document.getElementById('autoLocation');

        if (tempUnitToggle) {
            tempUnitToggle.addEventListener('change', (e) => {
                console.log('Sıcaklık birimi değiştirildi:', e.target.checked);
                this.updateSetting('tempUnit', e.target.checked ? 'F' : 'C');
            });
        }
        
        if (windUnitToggle) {
            windUnitToggle.addEventListener('change', (e) => {
                console.log('Rüzgar birimi değiştirildi:', e.target.checked);
                this.updateSetting('windUnit', e.target.checked ? 'kt' : 'km/s');
            });
        }
        
        if (animationsToggle) {
            animationsToggle.addEventListener('change', (e) => {
                console.log('Animasyonlar değiştirildi:', e.target.checked);
                this.updateSetting('animations', e.target.checked);
            });
        }

        if (autoLocationToggle) {
            autoLocationToggle.addEventListener('change', (e) => {
                console.log('Otomatik konum değiştirildi:', e.target.checked);
                this.updateSetting('autoLocation', e.target.checked);
                if (e.target.checked) {
                    this.getCurrentLocation();
                }
            });
        }

        // Favoriler modalı için olaylar
        if (this.favoritesBtn && this.favoritesModal && this.closeFavorites) {
            this.favoritesBtn.addEventListener('click', () => {
                console.log('Favoriler butonu tıklandı');
                this.openFavoritesModal();
            });
            
            this.closeFavorites.addEventListener('click', () => {
                console.log('Favoriler kapatma butonu tıklandı');
                this.closeFavoritesModal();
            });
            
            this.favoritesModal.addEventListener('click', (e) => {
                if (e.target === this.favoritesModal) {
                    this.closeFavoritesModal();
                }
            });
        } else {
            console.error('Favoriler butonları veya modal bulunamadı');
        }

        // Konum butonu olayları
        if (this.locationBtn) {
            this.locationBtn.addEventListener('click', () => {
                console.log('Konum butonu tıklandı');
                this.getCurrentLocation();
            });
        } else {
            console.error('Konum butonu bulunamadı');
        }
    }

    initTheme() {
        if (this.isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.initTheme();
    }

    initSettings() {
        // Toggle düğmelerinin başlangıç durumlarını ayarla
        document.getElementById('tempUnit').checked = this.settings.tempUnit === 'F';
        document.getElementById('windUnit').checked = this.settings.windUnit === 'kt';
        document.getElementById('animations').checked = this.settings.animations;
        
        // Otomatik konum ayarını ekle
        const locationToggle = document.getElementById('autoLocation');
        if (locationToggle) {
            locationToggle.checked = this.settings.autoLocation;
            locationToggle.addEventListener('change', (e) => {
                this.updateSetting('autoLocation', e.target.checked);
                if (e.target.checked) {
                    this.getCurrentLocation();
                }
            });
        }
        
        // Animasyonları kontrol et
        if (!this.settings.animations) {
            document.body.classList.add('no-animations');
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem(key, value);
        
        // Ayar değişikliklerini uygula
        if (key === 'animations') {
            document.body.classList.toggle('no-animations', !value);
        }
        
        // Mevcut hava durumu verilerini güncelle
        if (this.lastWeatherData) {
            this.displayCurrentWeather(this.lastWeatherData);
        }
    }

    openSettings() {
        console.log('Ayarlar açılıyor...');
        if (this.settingsModal) {
            this.settingsModal.classList.add('active');
            console.log('Ayarlar modalı açıldı');
        } else {
            console.error('Ayarlar modalı bulunamadı');
        }
    }

    closeSettingsModal() {
        console.log('Ayarlar kapatılıyor...');
        if (this.settingsModal) {
            this.settingsModal.classList.remove('active');
            console.log('Ayarlar modalı kapatıldı');
        } else {
            console.error('Ayarlar modalı bulunamadı');
        }
    }

    openFavoritesModal() {
        console.log('Favoriler açılıyor...');
        if (this.favoritesModal) {
            this.favoritesModal.classList.add('active');
            this.updateFavoritesList();
            console.log('Favoriler modalı açıldı');
        } else {
            console.error('Favoriler modalı bulunamadı');
        }
    }

    closeFavoritesModal() {
        console.log('Favoriler kapatılıyor...');
        if (this.favoritesModal) {
            this.favoritesModal.classList.remove('active');
            console.log('Favoriler modalı kapatıldı');
        } else {
            console.error('Favoriler modalı bulunamadı');
        }
    }

    updateFavoritesList() {
        console.log('Favori listesi güncelleniyor');
        const favoritesList = document.getElementById('favoritesList');
        const recentSearches = document.getElementById('recentSearches');

        if (!favoritesList || !recentSearches) {
            console.error('Favori veya son aramalar listesi bulunamadı');
            return;
        }

        // Favori konumları göster
        let favoritesHtml = '';
        if (this.favoriteLocations.length > 0) {
            this.favoriteLocations.forEach(location => {
                favoritesHtml += `
                    <div class="location-item" data-name="${location.name}" data-country="${location.country}">
                        <span class="location-name">${location.name}, ${location.country}</span>
                        <i class="fas fa-star favorite-icon active"></i>
                    </div>
                `;
            });
        } else {
            favoritesHtml = '<p class="no-data">Henüz favori konum eklenmemiş</p>';
        }
        favoritesList.innerHTML = favoritesHtml;

        // Son aramaları göster
        let recentHtml = '<h3>Son Aramalar</h3>';
        if (this.recentLocations.length > 0) {
            this.recentLocations.forEach(location => {
                const isFav = this.isFavorite(location.name, location.country);
                recentHtml += `
                    <div class="location-item" data-name="${location.name}" data-country="${location.country}">
                        <span class="location-name">${location.name}, ${location.country}</span>
                        <i class="fas fa-star favorite-icon ${isFav ? 'active' : ''}"></i>
                    </div>
                `;
            });
        } else {
            recentHtml += '<p class="no-data">Henüz arama geçmişi yok</p>';
        }
        recentSearches.innerHTML = recentHtml;

        // Tüm konum öğelerine tıklama olayları ekle
        const addClickEvents = (container) => {
            container.querySelectorAll('.location-item').forEach(item => {
                const starIcon = item.querySelector('.favorite-icon');
                const locationName = item.querySelector('.location-name');

                // Yıldız ikonuna tıklama olayı
                if (starIcon) {
                    starIcon.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Yıldıza tıklandı');
                        const locationData = {
                            name: item.dataset.name,
                            country: item.dataset.country
                        };
                        this.toggleFavorite(locationData);
                    };
                }

                // Konum metnine tıklama olayı
                if (locationName) {
                    locationName.onclick = async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Konuma tıklandı');
                        this.cityInput.value = item.dataset.name;
                        await this.getWeather();
                        this.closeFavoritesModal();
                    };
                }
            });
        };

        // Her iki listeye de olay dinleyicileri ekle
        addClickEvents(favoritesList);
        addClickEvents(recentSearches);
    }

    toggleFavorite(location) {
        try {
            console.log('Favori ekleniyor/çıkarılıyor:', location);
            
            if (!location || !location.name || !location.country) {
                throw new Error('Geçersiz konum bilgisi');
            }
            
            const index = this.favoriteLocations.findIndex(loc => 
                loc.name.toLowerCase() === location.name.toLowerCase() && 
                loc.country === location.country
            );
            
            if (index === -1) {
                // Favorilere ekle
                this.favoriteLocations.push({
                    name: location.name,
                    country: location.country
                });
                this.showError(`${location.name} favorilere eklendi`, true);
            } else {
                // Favorilerden çıkar
                this.favoriteLocations.splice(index, 1);
                this.showError(`${location.name} favorilerden çıkarıldı`, true);
            }
            
            // Local storage'ı güncelle
            localStorage.setItem('favoriteLocations', JSON.stringify(this.favoriteLocations));
            
            // Favori listesini güncelle
            this.updateFavoritesList();
            
            // Konum önerilerini güncelle
            if (this.cityInput.value.trim().length >= 3) {
                this.handleLocationInput();
            }
            
        } catch (error) {
            console.error('Favori işlemi hatası:', error);
            this.showError('Favori işlemi başarısız oldu: ' + error.message);
        }
    }

    handleLocationInput() {
        const query = this.cityInput.value.trim();
        
        if (query.length < 3) {
            this.locationSuggestions.style.display = 'none';
            return;
        }

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`${this.apiUrl}/geo/1.0/direct?q=${query},TR&limit=5&appid=${this.apiKey}`);
                const data = await response.json();
                
                if (data.length > 0) {
                    let suggestionsHtml = '<div class="suggestions-section">';
                    data.forEach(location => {
                        if (location.country === 'TR') {
                            const locationName = location.local_names?.tr || location.name;
                            const isFav = this.isFavorite(locationName, 'TR');
                            suggestionsHtml += `
                                <div class="location-item" data-name="${locationName}" data-country="TR">
                                    <span class="location-name">${locationName}, TR</span>
                                    <i class="fas fa-star favorite-icon ${isFav ? 'active' : ''}"></i>
                                </div>
                            `;
                        }
                    });
                    suggestionsHtml += '</div>';
                    
                    this.locationSuggestions.innerHTML = suggestionsHtml;
                    this.locationSuggestions.style.display = 'block';
                    
                    // Önerilere tıklama olayları ekle
                    this.locationSuggestions.querySelectorAll('.location-item').forEach(item => {
                        const starIcon = item.querySelector('.favorite-icon');
                        const locationName = item.querySelector('.location-name');

                        if (starIcon) {
                            starIcon.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Öneri yıldızına tıklandı');
                                const locationData = {
                                    name: item.dataset.name,
                                    country: item.dataset.country
                                };
                                this.toggleFavorite(locationData);
                            };
                        }

                        if (locationName) {
                            locationName.onclick = async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Öneri konumuna tıklandı');
                                this.cityInput.value = item.dataset.name;
                                await this.getWeather();
                                this.locationSuggestions.style.display = 'none';
                            };
                        }
                    });
                } else {
                    this.locationSuggestions.style.display = 'none';
                }
            } catch (error) {
                console.error('Konum önerileri alınamadı:', error);
                this.locationSuggestions.style.display = 'none';
            }
        }, 300);
    }

    isFavorite(name, country) {
        return this.favoriteLocations.some(loc => 
            loc.name.toLowerCase() === name.toLowerCase() && 
            loc.country === country
        );
    }

    addToRecentLocations(location) {
        // Aynı konumu listeden kaldır
        this.recentLocations = this.recentLocations.filter(loc => 
            !(loc.name === location.name && loc.country === location.country)
        );
        
        // Yeni konumu başa ekle
        this.recentLocations.unshift(location);
        
        // Son 5 aramayı tut
        if (this.recentLocations.length > 5) {
            this.recentLocations = this.recentLocations.slice(0, 5);
        }
        
        localStorage.setItem('recentLocations', JSON.stringify(this.recentLocations));
    }

    displayLocationSuggestions() {
        const suggestionsContainer = document.querySelector('.location-suggestions');
        if (!suggestionsContainer) return;

        let html = '<div class="suggestions-section favorites">';
        html += '<h3>Favori Konumlar</h3>';
        
        if (this.favoriteLocations.length > 0) {
            this.favoriteLocations.forEach(location => {
                html += `
                    <div class="location-item" data-name="${location.name}" data-country="${location.country}">
                        <span>${location.name}, ${location.country}</span>
                        <i class="fas fa-star favorite-icon active"></i>
                    </div>
                `;
            });
        } else {
            html += '<p class="no-data">Henüz favori konum eklenmemiş</p>';
        }
        
        html += '</div><div class="suggestions-section recent">';
        html += '<h3>Son Aramalar</h3>';
        
        if (this.recentLocations.length > 0) {
            this.recentLocations.forEach(location => {
                const isFav = this.isFavorite(location.name, location.country);
                html += `
                    <div class="location-item" data-name="${location.name}" data-country="${location.country}">
                        <span>${location.name}, ${location.country}</span>
                        <i class="fas fa-star favorite-icon ${isFav ? 'active' : ''}"></i>
                    </div>
                `;
            });
        } else {
            html += '<p class="no-data">Henüz arama geçmişi yok</p>';
        }
        
        html += '</div>';
        suggestionsContainer.innerHTML = html;
        
        // Konum öğelerine tıklama olayları ekle
        suggestionsContainer.querySelectorAll('.location-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                if (e.target.classList.contains('favorite-icon')) {
                    // Favori ikonuna tıklandığında
                    const locationData = {
                        name: item.dataset.name,
                        country: item.dataset.country
                    };
                    this.toggleFavorite(locationData);
                } else {
                    // Konum öğesine tıklandığında
                    const cityName = item.dataset.name;
                    this.cityInput.value = cityName;
                    await this.getWeather();
                }
            });
        });
    }

    convertTemp(temp, unit) {
        if (unit === 'F') {
            return (temp * 9/5) + 32;
        }
        return temp;
    }

    convertWindSpeed(speed, unit) {
        if (unit === 'kt') {
            return speed * 0.539957; // km/s'den knota çevir
        }
        return speed;
    }

    setLoading(loading) {
        this.loadingState = loading;
        this.searchBtn.disabled = loading;
        this.cityInput.disabled = loading;
        
        // Loading durumunu görsel olarak göster
        if (loading) {
            this.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            this.searchBtn.innerHTML = '<i class="fas fa-search"></i>';
        }
    }

    async getWeather() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('Lütfen bir şehir adı giriniz.');
            return;
        }

        this.setLoading(true);

        try {
            const currentWeather = await this.fetchWeatherData(city, 'weather');
            const forecast = await this.fetchWeatherData(city, 'forecast');
            
            // Forecast ve sun-info bölümlerini görünür yap
            const forecastElement = document.getElementById('forecast');
            const sunInfo = document.querySelector('.sun-info');
            if (forecastElement) forecastElement.style.display = 'grid';
            if (sunInfo) sunInfo.style.display = 'grid';
            
            // Favori yıldızını güncelle
            this.updateFavoriteButton(city, 'TR');
            
            this.displayCurrentWeather(currentWeather);
            this.displayForecast(forecast);
            
            this.addToRecentLocations({
                name: city,
                country: 'TR'
            });
        } catch (error) {
            console.error('Hava durumu bilgisi alınamadı:', error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async fetchWeatherData(city, type) {
        try {
            const url = `${this.apiUrl}/${type}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${config.units}&lang=${config.lang}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Şehir bulunamadı. Lütfen şehir adını kontrol ediniz.');
                } else if (response.status === 401) {
                    throw new Error('API anahtarı geçersiz. Lütfen config.js dosyasındaki API anahtarını kontrol ediniz.');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Hata kodu: ${response.status}`);
                }
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API Hatası (${type}):`, error);
            throw error;
        }
    }

    showError(message, isSuccess = false) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${isSuccess ? '#4caf50' : '#ff5252'};
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }

    saveToRecentSearches(city) {
        let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        // Şehri listenin başına ekle ve tekrarları kaldır
        recentSearches = [city, ...recentSearches.filter(item => item !== city)].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }

    getWindDirection(degree) {
        const directions = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 
                          'G', 'GGB', 'GB', 'BGB', 'B', 'BKB', 'KB', 'KKB'];
        const index = Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 22.5) % 16;
        return directions[index];
    }

    createWindInfo(speed, degree) {
        const direction = this.getWindDirection(degree);
        return `
            <span class="wind-info">
                <i class="fas fa-location-arrow wind-direction" style="transform: rotate(${degree}deg)"></i>
                ${Math.round(speed)} km/s ${direction}
            </span>
        `;
    }

    getWeatherEffect(iconCode) {
        const effects = {
            // Açık hava (Güneşli)
            '01d': {
                icon: `<svg class="sun-effect" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" fill="#ffd700"/>
                    <g stroke="#ffd700" stroke-width="2">
                        <line x1="12" y1="3" x2="12" y2="5"/>
                        <line x1="12" y1="19" x2="12" y2="21"/>
                        <line x1="3" y1="12" x2="5" y2="12"/>
                        <line x1="19" y1="12" x2="21" y2="12"/>
                        <line x1="5.5" y1="5.5" x2="7" y2="7"/>
                        <line x1="17" y1="17" x2="18.5" y2="18.5"/>
                        <line x1="5.5" y1="18.5" x2="7" y2="17"/>
                        <line x1="17" y1="7" x2="18.5" y2="5.5"/>
                    </g>
                </svg>`,
                effect: 'sun-effect'
            },
            // Açık hava (Gece)
            '01n': {
                icon: `<svg class="moon-effect" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M12,2 C7.03,2 3,6.03 3,11 C3,15.97 7.03,20 12,20 C16.97,20 21,15.97 21,11 C21,10.54 20.96,10.08 20.9,9.64 C19.92,11.01 18.32,12 16.5,12 C13.74,12 11.5,9.76 11.5,7 C11.5,5.18 12.49,3.58 13.86,2.6 C13.42,2.54 12.96,2.5 12.5,2.5 L12,2 Z"/>
                </svg>`,
                effect: 'moon-effect'
            },
            // Parçalı bulutlu (Gündüz)
            '02d': {
                icon: `<svg class="partly-cloudy-effect" viewBox="0 0 24 24">
                    <circle cx="8" cy="8" r="3.5" fill="#ffd700"/>
                    <g stroke="#ffd700" stroke-width="1.5" opacity="0.9">
                        <line x1="8" y1="3" x2="8" y2="4.5"/>
                        <line x1="8" y1="11.5" x2="8" y2="13"/>
                        <line x1="3" y1="8" x2="4.5" y2="8"/>
                        <line x1="11.5" y1="8" x2="13" y2="8"/>
                    </g>
                    <path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/>
                </svg>`,
                effect: 'partly-cloudy-effect'
            },
            // Parçalı bulutlu (Gece)
            '02n': {
                icon: `<svg class="partly-cloudy-night-effect" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M8,3 C6.5,3 5,4.5 5,7 C5,9 6.5,10.5 8,10.5 C9,10.5 9.5,10 10,9 C9,9.5 8,9 7,8 C6,7 6,6 6.5,5 C7.5,5.5 8.5,5.5 9,5 C9.5,3.5 9,3 8,3 Z"/>
                    <path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/>
                </svg>`,
                effect: 'partly-cloudy-night-effect'
            },
            // Bulutlu
            '03d': {
                icon: `<svg class="cloud-effect" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/>
                </svg>`,
                effect: 'cloud-effect'
            },
            '03n': {
                icon: `<svg class="cloud-effect" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/>
                </svg>`,
                effect: 'cloud-effect'
            },
            // Çok bulutlu
            '04d': {
                icon: `<svg class="cloud-effect" viewBox="0 0 24 24">
                    <path fill="currentColor" opacity="0.7" d="M15,15 C17.21,15 19,13.21 19,11 C19,8.79 17.21,7 15,7 L14.17,7.06 C13.5,4.44 11.37,2.5 8.5,2.5 C4.91,2.5 2,5.41 2,9 C2,12.59 4.91,15.5 8.5,15.5 L15,15 Z"/>
                    <path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/>
                </svg>`,
                effect: 'cloud-effect'
            },
            '04n': {
                icon: `<svg class="cloud-effect" viewBox="0 0 24 24">
                    <path fill="currentColor" opacity="0.7" d="M15,15 C17.21,15 19,13.21 19,11 C19,8.79 17.21,7 15,7 L14.17,7.06 C13.5,4.44 11.37,2.5 8.5,2.5 C4.91,2.5 2,5.41 2,9 C2,12.59 4.91,15.5 8.5,15.5 L15,15 Z"/>
                    <path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/>
                </svg>`,
                effect: 'cloud-effect'
            },
            // Sağanak yağış
            '09d': {
                icon: '<svg class="rain-effect" viewBox="0 0 24 24"><path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/><path fill="none" stroke="currentColor" d="M8,18 L6,22 M12,18 L10,22 M16,18 L14,22"/></svg>',
                effect: 'rain-effect'
            },
            '09n': {
                icon: '<svg class="rain-effect" viewBox="0 0 24 24"><path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/><path fill="none" stroke="currentColor" d="M8,18 L6,22 M12,18 L10,22 M16,18 L14,22"/></svg>',
                effect: 'rain-effect'
            },
            // Hafif yağmur
            '10d': {
                icon: '<svg class="rain-effect" viewBox="0 0 24 24"><path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/><path fill="none" stroke="currentColor" d="M8,18 L6,22 M12,18 L10,22 M16,18 L14,22"/></svg>',
                effect: 'rain-effect'
            },
            '10n': {
                icon: '<svg class="rain-effect" viewBox="0 0 24 24"><path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/><path fill="none" stroke="currentColor" d="M8,18 L6,22 M12,18 L10,22 M16,18 L14,22"/></svg>',
                effect: 'rain-effect'
            },
            // Gök gürültülü
            '11d': {
                icon: '<svg class="thunder-effect" viewBox="0 0 24 24"><path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/><path fill="currentColor" d="M12,10 L9,15 L12,15 L10,20 L15,13 L12,13 L14,10 Z"/></svg>',
                effect: 'thunder-effect'
            },
            '11n': {
                icon: '<svg class="thunder-effect" viewBox="0 0 24 24"><path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/><path fill="currentColor" d="M12,10 L9,15 L12,15 L10,20 L15,13 L12,13 L14,10 Z"/></svg>',
                effect: 'thunder-effect'
            },
            // Karlı
            '13d': {
                icon: '<svg class="snow-effect" viewBox="0 0 24 24"><path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/><circle cx="8" cy="20" r="1" fill="currentColor"/><circle cx="12" cy="20" r="1" fill="currentColor"/><circle cx="16" cy="20" r="1" fill="currentColor"/></svg>',
                effect: 'snow-effect'
            },
            '13n': {
                icon: '<svg class="snow-effect" viewBox="0 0 24 24"><path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/><circle cx="8" cy="20" r="1" fill="currentColor"/><circle cx="12" cy="20" r="1" fill="currentColor"/><circle cx="16" cy="20" r="1" fill="currentColor"/></svg>',
                effect: 'snow-effect'
            },
            // Sisli
            '50d': {
                icon: '<svg class="mist-effect" viewBox="0 0 24 24"><path fill="currentColor" d="M3,8 L21,8 M5,12 L19,12 M7,16 L17,16"/></svg>',
                effect: 'mist-effect'
            },
            '50n': {
                icon: '<svg class="mist-effect" viewBox="0 0 24 24"><path fill="currentColor" d="M3,8 L21,8 M5,12 L19,12 M7,16 L17,16"/></svg>',
                effect: 'mist-effect'
            }
        };

        return effects[iconCode] || {
            icon: `<svg class="cloud-effect" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z"/>
            </svg>`,
            effect: 'cloud-effect'
        };
    }

    createWeatherEffects(container, effect) {
        // Önce efektler için bir container oluştur
        const effectsContainer = document.createElement('div');
        effectsContainer.className = 'weather-effects-container';
        container.appendChild(effectsContainer);

        if (effect === 'rain-effect') {
            const rainEffect = document.createElement('div');
            rainEffect.className = 'rain-effect';
            for (let i = 0; i < 20; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.animationDelay = `${Math.random() * 1.2}s`;
                drop.style.opacity = `${Math.random() * 0.3 + 0.5}`;
                rainEffect.appendChild(drop);
            }
            effectsContainer.appendChild(rainEffect);
        } else if (effect === 'snow-effect') {
            const snowEffect = document.createElement('div');
            snowEffect.className = 'snow-effect';
            for (let i = 0; i < 15; i++) {
                const flake = document.createElement('div');
                flake.className = 'snow-flake';
                flake.innerHTML = '❄';
                flake.style.left = `${Math.random() * 100}%`;
                flake.style.animationDelay = `${Math.random() * 2.5}s`;
                flake.style.fontSize = `${Math.random() * 4 + 4}px`;
                flake.style.opacity = `${Math.random() * 0.3 + 0.5}`;
                snowEffect.appendChild(flake);
            }
            effectsContainer.appendChild(snowEffect);
        }
    }

    createWeatherIcon(iconCode, description) {
        const container = document.createElement('div');
        container.className = 'weather-icon-container';
        
        const effectData = this.getWeatherEffect(iconCode);
        
        // SVG ikonu ekle
        container.innerHTML = effectData.icon;
        const iconElement = container.firstChild;
        iconElement.classList.add(effectData.effect);
        
        return container;
    }

    displayCurrentWeather(data) {
        try {
            if (!data) {
                console.error('Hava durumu verisi boş');
                this.showError('Hava durumu verisi alınamadı.');
                return;
            }

            // Karşılama ekranını bilgi paneline dönüştür
            const welcomeScreen = document.querySelector('.welcome-screen');
            if (welcomeScreen) {
                const temp = Math.round(this.convertTemp(data.main.temp, this.settings.tempUnit));
                const description = this.capitalizeFirstLetter(data.weather?.[0]?.description || 'Bilgi yok');
                const humidity = data.main?.humidity || 0;
                const windSpeed = Math.round(this.convertWindSpeed(data.wind?.speed || 0, this.settings.windUnit));
                
                // Hava kalitesi indeksi için API çağrısı
                if (data.coord) {
                    this.getAirQuality(data.coord.lat, data.coord.lon).then(airQuality => {
                        const aqi = airQuality?.list?.[0]?.main?.aqi || 1;
                        const aqiText = this.getAQIText(aqi);

                        // Aktivite önerisi oluştur
                        const activitySuggestion = this.getActivitySuggestion(temp, data.weather[0].id, aqi);

                        // Hava durumu uyarıları
                        const warnings = this.getWeatherWarnings(data);

                        welcomeScreen.innerHTML = `
                            <div class="weather-summary">
                                <div class="summary-header">
                                    <h2>Günlük Hava Durumu Özeti</h2>
                                </div>
                                
                                <div class="summary-details">
                                    <div class="main-info">
                                        <p class="temp-summary">${temp}°${this.settings.tempUnit} ve ${description}</p>
                                        <p class="conditions">Nem: %${humidity} | Rüzgar: ${windSpeed} ${this.settings.windUnit}</p>
                                    </div>

                                    <div class="air-quality-section">
                                        <h3>Hava Kalitesi</h3>
                                        <div class="aqi-indicator ${this.getAQIClass(aqi)}">
                                            <span class="aqi-value">${aqi}</span>
                                            <span class="aqi-text">${aqiText}</span>
                                        </div>
                                        <p class="aqi-description">${this.getAQIDescription(aqi)}</p>
                                    </div>

                                    ${warnings.length > 0 ? `
                                        <div class="weather-warnings">
                                            <h3>Hava Durumu Uyarıları</h3>
                                            <div class="warnings-list">
                                                ${warnings.map(warning => `
                                                    <div class="warning-item ${warning.severity}">
                                                        <i class="${warning.icon}"></i>
                                                        <span>${warning.message}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}

                                    <div class="activity-suggestion">
                                        <h3>Günlük Aktivite Önerisi</h3>
                                        <div class="suggestion-content">
                                            <i class="fas fa-lightbulb"></i>
                                            <p>${activitySuggestion}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;

                        // Stil güncellemeleri
                        welcomeScreen.style.background = 'var(--card-background)';
                        welcomeScreen.style.padding = '20px';
                        welcomeScreen.style.borderRadius = '15px';
                        welcomeScreen.style.marginBottom = '20px';
                        welcomeScreen.style.boxShadow = 'var(--shadow)';
                    });
                }
            }

            // Ana container'ı kontrol et
            const weatherInfo = document.querySelector('.weather-info');
            if (!weatherInfo) {
                console.error('weather-info elementi bulunamadı');
                throw new Error('Hava durumu bilgi container\'ı bulunamadı');
            }

            // Temel yapıyı oluştur
            let weatherHeader = weatherInfo.querySelector('.weather-header');
            let weatherBody = weatherInfo.querySelector('.weather-body');
            let weatherData = weatherInfo.querySelector('.weather-data');
            let weatherDetails = weatherInfo.querySelector('.weather-details');

            // Header bölümünü oluştur
            if (!weatherHeader) {
                console.log('weather-header oluşturuluyor...');
                weatherHeader = document.createElement('div');
                weatherHeader.className = 'weather-header';
                weatherInfo.insertBefore(weatherHeader, weatherInfo.firstChild);
            }

            // Şehir adı elementini oluştur
            let cityNameElement = weatherHeader.querySelector('.city-name');
            if (!cityNameElement) {
                console.log('city-name oluşturuluyor...');
                cityNameElement = document.createElement('h2');
                cityNameElement.className = 'city-name';
                cityNameElement.id = 'cityName';
                weatherHeader.appendChild(cityNameElement);
            }

            // Body bölümünü oluştur
            if (!weatherBody) {
                console.log('weather-body oluşturuluyor...');
                weatherBody = document.createElement('div');
                weatherBody.className = 'weather-body';
                weatherInfo.appendChild(weatherBody);
            }

            // İkon container'ı oluştur
            let iconContainer = weatherBody.querySelector('.weather-icon-container');
            if (!iconContainer) {
                console.log('weather-icon-container oluşturuluyor...');
                iconContainer = document.createElement('div');
                iconContainer.className = 'weather-icon-container';
                weatherBody.appendChild(iconContainer);
            }

            // Weather data bölümünü oluştur
            if (!weatherData) {
                console.log('weather-data oluşturuluyor...');
                weatherData = document.createElement('div');
                weatherData.className = 'weather-data';
                weatherBody.appendChild(weatherData);
            }

            // Sıcaklık elementlerini oluştur
            if (!weatherData.querySelector('.temperature')) {
                console.log('temperature elementi oluşturuluyor...');
                const tempDiv = document.createElement('div');
                tempDiv.className = 'temperature';
                tempDiv.innerHTML = '<span id="currentTemp"></span><span class="unit">°C</span>';
                weatherData.appendChild(tempDiv);
            }

            if (!weatherData.querySelector('.temperature-feels')) {
                console.log('temperature-feels elementi oluşturuluyor...');
                const feelsDiv = document.createElement('div');
                feelsDiv.className = 'temperature-feels';
                feelsDiv.innerHTML = 'Hissedilen: <span id="feelsLike"></span><span class="unit">°C</span>';
                weatherData.appendChild(feelsDiv);
            }

            if (!weatherData.querySelector('.weather-description')) {
                console.log('weather-description elementi oluşturuluyor...');
                const descDiv = document.createElement('div');
                descDiv.className = 'weather-description';
                descDiv.id = 'weatherDesc';
                weatherData.appendChild(descDiv);
            }

            // Weather details bölümünü oluştur
            if (!weatherDetails) {
                console.log('weather-details oluşturuluyor...');
                weatherDetails = document.createElement('div');
                weatherDetails.className = 'weather-details';
                weatherInfo.appendChild(weatherDetails);
            }

            // Verileri güncelle
            const tempUnit = this.settings.tempUnit || 'C';
            const temp = this.convertTemp(data.main.temp, tempUnit);
            const feelsLike = this.convertTemp(data.main.feels_like, tempUnit);

            // Elementleri güncelle
            cityNameElement.textContent = `${data.name || 'Bilinmeyen Şehir'}, ${data.sys?.country || 'TR'}`;
            document.getElementById('currentTemp').textContent = Math.round(temp);
            document.getElementById('feelsLike').textContent = Math.round(feelsLike);
            document.getElementById('weatherDesc').textContent = this.capitalizeFirstLetter(data.weather?.[0]?.description || 'Bilgi yok');

            // Hava durumu ikonunu güncelle
            const weatherIcon = this.createWeatherIcon(data.weather?.[0]?.icon || '01d', data.weather?.[0]?.description || 'bilinmeyen');
            iconContainer.innerHTML = '';
            iconContainer.appendChild(weatherIcon);

            // Hava durumu detaylarını güncelle
            const precipitation = data.rain?.['1h'] || data.snow?.['1h'] || 0;
            const precipitationType = data.rain ? 'Yağmur' : (data.snow ? 'Kar' : '');
            const precipitationProbability = data.pop ? Math.round(data.pop * 100) : 0;

            weatherDetails.innerHTML = `
                <div class="detail">
                    <i class="fas fa-temperature-high"></i>
                    <div class="detail-info">
                        <div class="detail-label">En Yüksek</div>
                        <div class="detail-value">${Math.round(this.convertTemp(data.main?.temp_max || temp, tempUnit))}°${tempUnit}</div>
                    </div>
                </div>
                <div class="detail">
                    <i class="fas fa-temperature-low"></i>
                    <div class="detail-info">
                        <div class="detail-label">En Düşük</div>
                        <div class="detail-value">${Math.round(this.convertTemp(data.main?.temp_min || temp, tempUnit))}°${tempUnit}</div>
                    </div>
                </div>
                <div class="detail">
                    <i class="fas fa-wind"></i>
                    <div class="detail-info">
                        <div class="detail-label">Rüzgar</div>
                        <div class="detail-value">${Math.round(this.convertWindSpeed(data.wind?.speed || 0, this.settings.windUnit))} ${this.settings.windUnit} ${this.getWindDirection(data.wind?.deg || 0)}</div>
                    </div>
                </div>
                <div class="detail">
                    <i class="fas fa-droplet"></i>
                    <div class="detail-info">
                        <div class="detail-label">Nem</div>
                        <div class="detail-value">%${data.main?.humidity || 0}</div>
                    </div>
                </div>
                ${precipitation > 0 || precipitationProbability > 0 ? `
                <div class="detail precipitation-detail">
                    <i class="fas fa-cloud-showers-heavy"></i>
                    <div class="detail-info">
                        <div class="detail-label">${precipitationType || 'Yağış'}</div>
                        <div class="detail-value">
                            ${precipitation > 0 ? `${precipitation.toFixed(1)} mm` : ''}
                            ${precipitationProbability > 0 ? `<br>Olasılık: %${precipitationProbability}` : ''}
                        </div>
                    </div>
                </div>` : ''}
                <div class="detail">
                    <i class="fas fa-compress-arrows-alt"></i>
                    <div class="detail-info">
                        <div class="detail-label">Basınç</div>
                        <div class="detail-value">${data.main?.pressure || 0} hPa</div>
                    </div>
                </div>
                <div class="detail">
                    <i class="fas fa-mountain"></i>
                    <div class="detail-info">
                        <div class="detail-label">Rakım</div>
                        <div class="detail-value">${Math.round(data.coord?.lat || 0)}m</div>
                    </div>
                </div>
                <div class="detail">
                    <i class="fas fa-eye"></i>
                    <div class="detail-info">
                        <div class="detail-label">Görüş Mesafesi</div>
                        <div class="detail-value">${(data.visibility || 0) / 1000} km</div>
                    </div>
                </div>
                <div class="detail">
                    <i class="fas fa-cloud"></i>
                    <div class="detail-info">
                        <div class="detail-label">Bulutluluk</div>
                        <div class="detail-value">%${data.clouds?.all || 0}</div>
                    </div>
                </div>
                <div class="detail">
                    <i class="fas fa-sun"></i>
                    <div class="detail-info">
                        <div class="detail-label">UV İndeksi</div>
                        <div class="detail-value">${data.uvi || 0}</div>
                    </div>
                </div>
                <div class="detail">
                    <i class="fas fa-thermometer-half"></i>
                    <div class="detail-info">
                        <div class="detail-label">Çiy Noktası</div>
                        <div class="detail-value">${Math.round(data.main?.dew_point || temp)}°${tempUnit}</div>
                    </div>
                </div>
                <div class="detail">
                    <i class="fas fa-tachometer-alt"></i>
                    <div class="detail-info">
                        <div class="detail-label">Rüzgar Hamlesi</div>
                        <div class="detail-value">${Math.round(this.convertWindSpeed(data.wind?.gust || 0, this.settings.windUnit))} ${this.settings.windUnit}</div>
                    </div>
                </div>
                <div class="detail">
                    <i class="fas fa-clock"></i>
                    <div class="detail-info">
                        <div class="detail-label">Yerel Saat</div>
                        <div class="detail-value">${new Date(data.dt * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
            `;

            // Güneş bilgilerini güncelle
            const sunInfo = weatherInfo.querySelector('.sun-info');
            if (!sunInfo) {
                const sunInfoDiv = document.createElement('div');
                sunInfoDiv.className = 'sun-info';
                sunInfoDiv.innerHTML = `
                    <div class="sun-detail sunrise">
                        <svg class="sunrise-icon" viewBox="0 0 24 24">
                            <path class="horizon" d="M2 20h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <g class="sun-group">
                                <circle class="sun" cx="12" cy="12" r="4" fill="#FFD700"/>
                                <line x1="12" y1="4" x2="12" y2="2" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
                                <line x1="5" y1="12" x2="3" y2="12" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
                                <line x1="21" y1="12" x2="19" y2="12" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
                            </g>
                        </svg>
                        <div class="detail-info">
                            <div class="detail-label">Gün Doğumu</div>
                            <div class="detail-value" id="sunrise"></div>
                        </div>
                    </div>
                    <div class="sun-detail sunset">
                        <svg class="sunset-icon" viewBox="0 0 24 24">
                            <path class="horizon" d="M2 20h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <g class="sun-group">
                                <circle class="sun" cx="12" cy="12" r="4" fill="#FF8C00"/>
                                <line x1="12" y1="4" x2="12" y2="2" stroke="#FF8C00" stroke-width="2" stroke-linecap="round"/>
                                <line x1="5" y1="12" x2="3" y2="12" stroke="#FF8C00" stroke-width="2" stroke-linecap="round"/>
                                <line x1="21" y1="12" x2="19" y2="12" stroke="#FF8C00" stroke-width="2" stroke-linecap="round"/>
                            </g>
                        </svg>
                        <div class="detail-info">
                            <div class="detail-label">Gün Batımı</div>
                            <div class="detail-value" id="sunset"></div>
                        </div>
                    </div>
                `;
                weatherInfo.appendChild(sunInfoDiv);
            }

            // Güneş doğuş ve batış saatlerini güncelle
            if (data.sys?.sunrise && data.sys?.sunset) {
                const sunrise = document.getElementById('sunrise');
                const sunset = document.getElementById('sunset');
                if (sunrise && sunset) {
                    sunrise.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    sunset.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                }
                document.querySelector('.sun-info').style.display = 'grid';
            }

            // Son hava durumu verisini sakla
            this.lastWeatherData = data;

        } catch (error) {
            console.error('Hava durumu görüntüleme hatası:', error);
            this.showError(`Hava durumu bilgileri görüntülenirken bir hata oluştu: ${error.message}`);
            this.displayWelcomeScreen();
        }
    }

    displayHourlyForecast(hourlyData) {
        if (!hourlyData) return;

        const container = document.querySelector('.current-weather');
        let hourlySection = container.querySelector('.hourly-forecast');
        
        if (!hourlySection) {
            hourlySection = document.createElement('div');
            hourlySection.className = 'hourly-forecast';
            container.appendChild(hourlySection);
        }

        const hourlyScroll = document.createElement('div');
        hourlyScroll.className = 'hourly-scroll';

        const next24Hours = hourlyData.slice(0, 24);
        hourlyScroll.innerHTML = next24Hours.map((hour, index) => {
            const date = new Date(hour.dt * 1000);
            const timeStr = date.getHours().toString().padStart(2, '0') + ':00';
            
            return `
                <div class="hour-card">
                    <div class="time">${index === 0 ? 'Şimdi' : timeStr}</div>
                    ${this.createWeatherIcon(hour.weather[0].icon, hour.weather[0].description).outerHTML}
                    <div class="temp">${Math.round(hour.temp)}°C</div>
                    <div class="hour-details">
                        <span><i class="fas fa-tint"></i> %${hour.humidity}</span>
                        <span>${Math.round(hour.wind_speed)} km/s</span>
                    </div>
                </div>
            `;
        }).join('');

        hourlySection.innerHTML = '';
        hourlySection.appendChild(hourlyScroll);
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    displayForecast(data) {
        try {
            const forecastContainer = document.getElementById('forecast');
            forecastContainer.innerHTML = '';

            const dailyForecasts = this.groupForecastsByDay(data.list);
            dailyForecasts.forEach(forecast => {
                const card = this.createForecastCard(forecast);
                forecastContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Tahmin görüntüleme hatası:', error);
            this.showError('Hava durumu tahminleri görüntülenirken bir hata oluştu.');
        }
    }

    groupForecastsByDay(forecastList) {
        const dailyForecasts = {};
        
        forecastList.forEach(forecast => {
            const date = new Date(forecast.dt * 1000).toLocaleDateString();
            
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    ...forecast,
                    hourlyData: [forecast],
                    main: {
                        ...forecast.main,
                        temp_min: forecast.main.temp_min,
                        temp_max: forecast.main.temp_max
                    }
                };
            } else {
                // Saatlik verileri ekle
                dailyForecasts[date].hourlyData.push(forecast);
                // Güncelle min ve max sıcaklıkları
                dailyForecasts[date].main.temp_min = Math.min(dailyForecasts[date].main.temp_min, forecast.main.temp_min);
                dailyForecasts[date].main.temp_max = Math.max(dailyForecasts[date].main.temp_max, forecast.main.temp_max);
            }
        });

        return Object.values(dailyForecasts).slice(0, 5);
    }

    createForecastCard(forecast) {
        const date = new Date(forecast.dt * 1000);
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        const weatherIcon = this.createWeatherIcon(forecast.weather[0].icon, forecast.weather[0].description);
        const tempUnit = this.settings.tempUnit;
        const windUnit = this.settings.windUnit;
        
        card.innerHTML = `
            <h3>${date.toLocaleDateString('tr-TR', { weekday: 'long' })}</h3>
            ${weatherIcon.outerHTML}
            <p class="temp">${Math.round(this.convertTemp(forecast.main.temp, tempUnit))}°${tempUnit}</p>
            <div class="temp-range">
                <span><i class="fas fa-temperature-high"></i> ${Math.round(this.convertTemp(forecast.main.temp_max, tempUnit))}°${tempUnit}</span>
                <span><i class="fas fa-temperature-low"></i> ${Math.round(this.convertTemp(forecast.main.temp_min, tempUnit))}°${tempUnit}</span>
            </div>
            <p class="desc">${this.capitalizeFirstLetter(forecast.weather[0].description)}</p>
            <div class="forecast-details">
                <span><i class="fas fa-tint"></i> ${forecast.main.humidity}%</span>
                <span><i class="fas fa-wind"></i> ${Math.round(this.convertWindSpeed(forecast.wind.speed, windUnit))} ${windUnit}</span>
            </div>
            <div class="hourly-chart" style="display: none;">
                <canvas></canvas>
            </div>
        `;

        // Karta tıklama olayı ekle
        card.addEventListener('click', () => this.toggleHourlyChart(card, forecast.hourlyData));

        return card;
    }

    toggleHourlyChart(card, hourlyData) {
        const chartContainer = card.querySelector('.hourly-chart');
        const canvas = chartContainer.querySelector('canvas');
        
        // Tüm kartların active sınıfını kaldır
        document.querySelectorAll('.forecast-card').forEach(c => {
            if (c !== card) {
                c.classList.remove('active');
            }
        });

        // Tüm diğer grafikleri gizle
        document.querySelectorAll('.hourly-chart').forEach(chart => {
            if (chart !== chartContainer) {
                chart.style.display = 'none';
            }
        });

        // Seçilen grafiği aç/kapat ve kartı aktifleştir/deaktifleştir
        if (chartContainer.style.display === 'none') {
            chartContainer.style.display = 'block';
            card.classList.add('active');
            setTimeout(() => this.createHourlyChart(canvas, hourlyData), 50);
        } else {
            chartContainer.style.display = 'none';
            card.classList.remove('active');
        }
    }

    createHourlyChart(canvas, hourlyData) {
        // Mevcut grafiği temizle
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        const hours = hourlyData.map(data => {
            const date = new Date(data.dt * 1000);
            return date.getHours() + ':00';
        });

        const temperatures = hourlyData.map(data => 
            Math.round(this.convertTemp(data.main.temp, this.settings.tempUnit))
        );

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: `Sıcaklık (°${this.settings.tempUnit})`,
                    data: temperatures,
                    borderColor: '#64b5f6',
                    backgroundColor: 'rgba(100, 181, 246, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    async initLocationFeatures() {
        // Sadece konum önerilerini göster
        this.displayLocationSuggestions();
    }

    async getCurrentLocation() {
        try {
            if (!navigator.geolocation) {
                throw new Error('Tarayıcınız konum özelliğini desteklemiyor.');
            }

            this.setLoading(true);
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        console.log('Konum başarıyla alındı');
                        resolve(pos);
                    },
                    (err) => {
                        console.error('Konum hatası:', err);
                        reject(err);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            });
            
            const { latitude, longitude } = position.coords;
            console.log('Konum koordinatları:', { latitude, longitude });
            
            // Önce reverse geocoding ile şehir adını al
            const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${this.apiKey}`;
            console.log('Geo API isteği yapılıyor:', geoUrl);
            
            const geoResponse = await fetch(geoUrl);
            if (!geoResponse.ok) {
                throw new Error(`Geo API hatası: ${geoResponse.status}`);
            }
            
            const geoData = await geoResponse.json();
            console.log('Geo API yanıtı:', geoData);
            
            if (!geoData || geoData.length === 0) {
                throw new Error('Şehir bilgisi alınamadı');
            }
            
            const cityName = geoData[0].local_names?.tr || geoData[0].name;
            console.log('Tespit edilen şehir:', cityName);
            
            // Şehir adıyla hava durumu bilgisini al
            const weatherUrl = `${this.apiUrl}/weather?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric&lang=tr`;
            console.log('Hava durumu API isteği yapılıyor:', weatherUrl);
            
            const weatherResponse = await fetch(weatherUrl);
            if (!weatherResponse.ok) {
                throw new Error(`Hava durumu API hatası: ${weatherResponse.status}`);
            }
            
            const weatherData = await weatherResponse.json();
            console.log('Hava durumu verisi:', weatherData);

            // Şehir adını ve hava durumunu güncelle
            this.cityInput.value = cityName;
            this.displayCurrentWeather(weatherData);
            
            // Son aramalara ekle
            this.addToRecentLocations({
                name: cityName,
                country: 'TR'
            });

            // 5 günlük tahmin için istek yap
            const forecastUrl = `${this.apiUrl}/forecast?q=${encodeURIComponent(cityName)}&appid=${this.apiKey}&units=metric&lang=tr`;
            console.log('Tahmin API isteği yapılıyor:', forecastUrl);
            
            const forecastResponse = await fetch(forecastUrl);
            if (forecastResponse.ok) {
                const forecastData = await forecastResponse.json();
                this.displayForecast(forecastData);
            }
            
        } catch (error) {
            console.error('Konum hatası detayları:', error);
            let errorMessage = 'Konum alınamadı: ';
            
            if (error.code === 1) {
                errorMessage += 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.';
            } else if (error.code === 2) {
                errorMessage += 'Konum bilgisi alınamadı. Lütfen internet bağlantınızı kontrol edin.';
            } else if (error.code === 3) {
                errorMessage += 'Konum tespiti zaman aşımına uğradı. Lütfen tekrar deneyin.';
            } else {
                errorMessage += error.message || 'Bilinmeyen bir hata oluştu.';
            }
            
            this.showError(errorMessage);
            this.displayWelcomeScreen();
        } finally {
            this.setLoading(false);
        }
    }

    updateFavoriteButton(cityName, country) {
        // Önce mevcut favori butonunu kontrol et
        let favoriteBtn = document.getElementById('favoriteBtn');
        
        // Eğer buton yoksa oluştur
        if (!favoriteBtn) {
            favoriteBtn = document.createElement('button');
            favoriteBtn.id = 'favoriteBtn';
            favoriteBtn.className = 'favorite-button';
            favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
            
            // Butonu arama çubuğunun yanına ekle
            const searchContainer = this.cityInput.parentElement;
            searchContainer.insertBefore(favoriteBtn, this.searchBtn);
        }
        
        // Her durumda tıklama olayını güncelle
        favoriteBtn.onclick = () => {
            const currentCity = this.cityInput.value.trim();
            const locationData = {
                name: currentCity,
                country: 'TR'
            };
            this.toggleFavorite(locationData);
            this.updateFavoriteButton(currentCity, 'TR');
        };
        
        // Butonun durumunu güncelle
        const isFav = this.isFavorite(cityName, country);
        favoriteBtn.classList.toggle('active', isFav);
        favoriteBtn.style.display = this.cityInput.value.trim() ? 'block' : 'none';
    }

    displayWelcomeScreen() {
        const weatherInfo = document.querySelector('.weather-info');
        if (!weatherInfo) return;

        weatherInfo.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-icon">
                    <svg class="weather-logo" viewBox="0 0 24 24" width="120" height="120">
                        <circle class="sun" cx="12" cy="12" r="4" fill="#ffd700"/>
                        <g class="sun-rays" stroke="#ffd700" stroke-width="2">
                            <line x1="12" y1="3" x2="12" y2="5"/>
                            <line x1="12" y1="19" x2="12" y2="21"/>
                            <line x1="3" y1="12" x2="5" y2="12"/>
                            <line x1="19" y1="12" x2="21" y2="12"/>
                            <line x1="5.5" y1="5.5" x2="7" y2="7"/>
                            <line x1="17" y1="17" x2="18.5" y2="18.5"/>
                            <line x1="5.5" y1="18.5" x2="7" y2="17"/>
                            <line x1="17" y1="7" x2="18.5" y2="5.5"/>
                        </g>
                        <path class="cloud" fill="#ffffff" d="M17,18 C19.21,18 21,16.21 21,14 C21,11.79 19.21,10 17,10 L16.17,10.06 C15.5,7.44 13.37,5.5 10.5,5.5 C6.91,5.5 4,8.41 4,12 C4,15.59 6.91,18.5 10.5,18.5 L17,18 Z" style="opacity: 0.8"/>
                    </svg>
                </div>
                <h2>Hava Durumunu Öğrenmek İçin</h2>
                <div class="welcome-options">
                    <div class="welcome-option">
                        <i class="fas fa-search"></i>
                        <p>Şehir adı yazarak arama yapın</p>
                    </div>
                    <div class="welcome-option">
                        <i class="fas fa-location-arrow"></i>
                        <p>Konumunuzu otomatik tespit edin</p>
                    </div>
                    <div class="welcome-option">
                        <i class="fas fa-star"></i>
                        <p>Favori şehirlerinizi kaydedin</p>
                    </div>
                </div>
                <div class="welcome-footer">
                    <p>Türkiye'nin tüm şehirleri için anlık ve 5 günlük hava durumu tahminleri</p>
                </div>
            </div>
        `;

        // Forecast ve diğer bölümleri gizle
        const forecast = document.getElementById('forecast');
        const sunInfo = document.querySelector('.sun-info');
        if (forecast) forecast.style.display = 'none';
        if (sunInfo) sunInfo.style.display = 'none';
    }

    async getAirQuality(lat, lon) {
        try {
            const response = await fetch(`${this.apiUrl}/air_pollution?lat=${lat}&lon=${lon}&appid=${this.apiKey}`);
            if (!response.ok) {
                throw new Error('Hava kalitesi verisi alınamadı');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Hava kalitesi verisi alınamadı:', error);
            return {
                list: [{
                    main: {
                        aqi: 1 // Varsayılan değer
                    }
                }]
            };
        }
    }

    getAQIText(aqi) {
        const aqiTexts = {
            1: 'İyi',
            2: 'Makul',
            3: 'Orta',
            4: 'Kötü',
            5: 'Çok Kötü'
        };
        return aqiTexts[aqi] || 'Bilinmiyor';
    }

    getAQIClass(aqi) {
        const aqiClasses = {
            1: 'aqi-good',
            2: 'aqi-fair',
            3: 'aqi-moderate',
            4: 'aqi-poor',
            5: 'aqi-very-poor'
        };
        return aqiClasses[aqi] || 'aqi-unknown';
    }

    getAQIDescription(aqi) {
        const descriptions = {
            1: 'Hava kalitesi mükemmel! Dışarıda vakit geçirmek için ideal.',
            2: 'Hava kalitesi iyi durumda. Normal aktivitelerinizi yapabilirsiniz.',
            3: 'Hassas gruplar için dikkatli olunmalı.',
            4: 'Uzun süreli dış mekan aktivitelerinden kaçının.',
            5: 'Dış mekan aktivitelerinden kaçının. Mümkünse içeride kalın.'
        };
        return descriptions[aqi] || 'Hava kalitesi bilgisi mevcut değil.';
    }

    getActivitySuggestion(temp, weatherId, aqi) {
        // Hava durumu kodlarına göre öneriler
        if (aqi >= 4) {
            return 'Hava kalitesi düşük olduğu için iç mekan aktiviteleri önerilir.';
        }

        if (temp > 30) {
            return 'Aşırı sıcak! Su sporları veya yüzme tercih edilebilir. Saat 11:00-15:00 arası dışarı çıkmamaya özen gösterin.';
        } else if (temp > 25) {
            return 'Sıcak bir gün! Park gezintisi, piknik veya bahçe aktiviteleri için uygun. Bol su için ve güneş kremi kullanın.';
        } else if (temp > 20) {
            return 'Harika bir hava! Yürüyüş, koşu veya bisiklet sürüşü için ideal.';
        } else if (temp > 10) {
            return 'Ilıman bir gün. Açık hava aktiviteleri için uygun, hafif bir hırka yanınızda bulundurabilirsiniz.';
        } else if (temp > 0) {
            return 'Serin bir gün. Yürüyüş veya koşu için uygun, kalın giyinin.';
        } else {
            return 'Soğuk bir gün! İç mekan aktiviteleri tercih edilebilir. Dışarı çıkmanız gerekirse çok kalın giyinin.';
        }
    }

    getWeatherWarnings(data) {
        const warnings = [];
        const temp = Math.round(this.convertTemp(data.main.temp, this.settings.tempUnit));
        const windSpeed = Math.round(this.convertWindSpeed(data.wind?.speed || 0, this.settings.windUnit));
        const humidity = data.main?.humidity || 0;
        const weatherId = data.weather?.[0]?.id;

        // Sıcaklık uyarıları
        if (temp >= 35) {
            warnings.push({
                severity: 'severe',
                icon: 'fas fa-thermometer-full',
                message: 'Aşırı sıcak hava! Lütfen önlem alın ve mümkünse dışarı çıkmayın.'
            });
        } else if (temp <= 0) {
            warnings.push({
                severity: 'severe',
                icon: 'fas fa-thermometer-empty',
                message: 'Dondurucu soğuk! Dikkatli olun ve kalın giyinin.'
            });
        }

        // Rüzgar uyarıları
        if (windSpeed > 50) {
            warnings.push({
                severity: 'severe',
                icon: 'fas fa-wind',
                message: 'Şiddetli rüzgar! Açık alanda dikkatli olun.'
            });
        } else if (windSpeed > 30) {
            warnings.push({
                severity: 'moderate',
                icon: 'fas fa-wind',
                message: 'Kuvvetli rüzgar bekleniyor.'
            });
        }

        // Nem uyarıları
        if (humidity > 80 && temp > 25) {
            warnings.push({
                severity: 'moderate',
                icon: 'fas fa-tint',
                message: 'Yüksek nem ve sıcaklık! Bunaltıcı hava koşulları.'
            });
        }

        // Hava durumu kodlarına göre uyarılar
        if (weatherId >= 200 && weatherId < 300) {
            warnings.push({
                severity: 'severe',
                icon: 'fas fa-bolt',
                message: 'Fırtına aktivitesi! Açık alanlardan uzak durun.'
            });
        } else if (weatherId >= 500 && weatherId < 600) {
            warnings.push({
                severity: 'moderate',
                icon: 'fas fa-cloud-rain',
                message: 'Yağmurlu hava, şemsiye bulundurun.'
            });
        } else if (weatherId >= 600 && weatherId < 700) {
            warnings.push({
                severity: 'moderate',
                icon: 'fas fa-snowflake',
                message: 'Kar yağışı bekleniyor, dikkatli olun.'
            });
        }

        return warnings;
    }
}

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', () => {
    const app = new WeatherApp();
    app.displayWelcomeScreen(); // Başlangıçta karşılama ekranını göster
    
    // Güneş bilgisi bölümünü gizle
    const sunInfo = document.querySelector('.sun-info');
    if (sunInfo) sunInfo.style.display = 'none';
    
    // Tahmin bölümünü gizle
    const forecast = document.getElementById('forecast');
    if (forecast) forecast.style.display = 'none';
}); 
