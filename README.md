# 🚗 DriveHours - Aplikacja do Śledzenia Nauki Jazdy

Nowoczesna aplikacja mobilna do monitorowania postępów w nauce jazdy, stworzona z użyciem Expo i React Native.

## ✨ Funkcje

- 📊 **Śledzenie postępu** - wizualizacja ukończonych godzin jazdy
- 📅 **Historia sesji** - pełna lista jazd z możliwością edycji
- 📈 **Statystyki i analityka** - wykresy, prognozy i osiągnięcia
- 🎯 **Kategorie prawa jazdy** - obsługa różnych kategorii (B, C, itp.)
- 🎨 **Nowoczesny design** - intuicyjny interfejs z płynnymi animacjami
- 💾 **Offline-first** - wszystkie dane przechowywane lokalnie

## 🚀 Szybki Start

### Instalacja

```bash
# Sklonuj repozytorium
git clone <repo-url>
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

## 📁 Struktura Projektu

```
DriveHours/
├── app/              # Strony aplikacji (Expo Router)
├── components/       # Komponenty React
├── hooks/            # Custom React Hooks
├── utils/            # Funkcje pomocnicze
├── types/            # Typy TypeScript
├── constants/        # Stałe konfiguracyjne
└── assets/           # Obrazy i ikony
```

Szczegółowy opis struktury: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 🛠️ Technologie

- **Framework**: [Expo](https://expo.dev) + React Native
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
- **Storage**: AsyncStorage
- **Language**: TypeScript
- **Grafika**: React Native SVG


## 🤝 Współpraca

1. Fork projektu
2. Utwórz branch (`git checkout -b feature/NowaCecha`)
3. Commit zmian (`git commit -m 'feat: Dodaj nową cechę'`)
4. Push do brancha (`git push origin feature/NowaCecha`)
5. Otwórz Pull Request

### Konwencje Commitów

- `feat:` - nowa funkcjonalność
- `fix:` - naprawa błędu
- `refactor:` - refaktoryzacja kodu
- `docs:` - dokumentacja
- `style:` - formatowanie kodu
- `test:` - dodanie testów
- `chore:` - konfiguracja, zależności

## 📝 Roadmapa

- [ ] Synchronizacja z chmurą
- [ ] Export danych do PDF
- [ ] Przypomnienia o jazdach
- [ ] Integracja z kalendarzem
- [ ] Tryb ciemny
- [ ] Obsługa wielu języków
- [ ] Widget na ekran główny

## 📄 Licencja

Projekt prywatny. Wszelkie prawa zastrzeżone.

## 👨‍💻 Autor

Stworzono z ❤️ dla uczących się kierowców

---

## 📚 Dodatkowe Zasoby

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [NativeWind Documentation](https://www.nativewind.dev/)

## 💡 Wsparcie

Jeśli napotkasz problemy lub masz pytania:
- Otwórz issue na GitHubie
- Sprawdź istniejące issues
- Przeczytaj dokumentację projektu
