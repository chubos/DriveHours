# DriveHours - Aplikacja do Śledzenia Nauki Jazdy

Nowoczesna aplikacja mobilna do monitorowania postępów w nauce jazdy, stworzona z użyciem Expo i React Native.

## Funkcje

- **Śledzenie postępu** - wizualizacja ukończonych godzin jazdy
- **Historia sesji** - pełna lista jazd z możliwością edycji
- **Statystyki i analityka** - wykresy, prognozy i osiągnięcia
- **Kategorie prawa jazdy** - obsługa różnych kategorii (B, C, itp.)
- **Nowoczesny design** - intuicyjny interfejs z płynnymi animacjami
- **Tryb ciemny** - automatyczne dostosowanie do systemu
- **Wielojęzyczność** - obsługa angielskiego i polskiego
- **Offline-first** - wszystkie dane przechowywane lokalnie

## Szybki Start

### Instalacja

```bash
# Sklonuj repozytorium
git clone https://github.com/chubos/DriveHours
cd DriveHours

# Zainstaluj zależności
npm install
```

### Uruchomienie

```bash
# Uruchom serwer developerski
npm start

# Lub bezpośrednio na platformie:
npm run ios       # iOS Simulator
npm run android   # Android Emulator
npm run web       # Przeglądarka
```

### Build Produkcyjny

```bash
# Build dla iOS
eas build --platform ios

# Build dla Android
eas build --platform android
```

##  Technologie

- **Framework**: [Expo](https://expo.dev) + React Native
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
- **Storage**: AsyncStorage
- **i18n**: [i18next](https://www.i18next.com/) + react-i18next


## Wsparcie

Jeśli napotkasz problemy lub masz pytania:
- Otwórz issue na GitHubie
- Sprawdź istniejące issues
- Przeczytaj dokumentację projektu
