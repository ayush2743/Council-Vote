 Council Vote Frontend

React Native mobile application for the Council Vote system built with Expo.

## Features

✨ **Role-Based Interface**
- **Candidate**: Browse positions, apply, vote, view results
- **Moderator**: Create positions, review candidate applications
- **Super Admin**: Approve positions, schedule voting, create moderators, publish results

🎨 **Beautiful UI**
- Custom color scheme with earthy tones (#f0ece6 background)
- STIX Two Text font for elegant typography
- NativeWind (Tailwind CSS) for styling
- Smooth animations and transitions

🔐 **Secure Authentication**
- JWT-based authentication
- Role-based access control
- Persistent login sessions

## Tech Stack

- **React Native** (via Expo)
- **Expo Router** - File-based routing
- **NativeWind** - Tailwind CSS for React Native
- **TypeScript** - Type safety
- **AsyncStorage** - Local data persistence
- **Expo Vector Icons** - Icon library

## Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Studio (for Android)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the App

Start the development server:
```bash
npm start
```

Then press:
- `i` for iOS Simulator (Mac only)
- `a` for Android Emulator
- `w` for web browser


## User Roles

### Candidate (Default)
- Browse available positions
- Apply for positions with manifesto
- Vote for approved candidates
- View published results
- Track application status

### Moderator
- Create positions with application deadlines
- Review pending candidate applications
- Approve/reject candidates (requires 2 moderators)
- View approved positions

### Super Admin
- Approve/reject positions created by moderators
- Set voting schedules (start & end dates)
- Create moderator accounts
- Publish voting results
- View system-wide statistics

## API Integration

The app connects to the backend API at `EXPO_PUBLIC_API_URL`.

### Authentication
- JWT tokens stored in AsyncStorage
- Auto-login on app restart
- Token sent in Authorization header

### Error Handling
- Network errors handled gracefully
- User-friendly error messages
- Pull-to-refresh on all lists

## Styling

### Color Palette
- Background: `#f0ece6` (Light Beige)
- Primary: `#8B6F47` (Warm Brown)
- Success: `#6B8E23` (Olive Green)
- Error: `#A0522D` (Sienna)
- Text: `#2C1810` (Dark Brown)

### Typography
- Font Family: STIX Two Text
- Loaded via Google Fonts
- Elegant serif font for readability

## Development Tips

### Hot Reload
Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) for dev menu

### Debugging
- Use React DevTools
- Check console logs in terminal
- Use `console.log()` for debugging

### Testing on Device
1. Install Expo Go app
2. Scan QR code from terminal
3. Make sure device is on same network

## Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## Troubleshooting

**API not connecting:**
- Check backend is running
- Verify `.env` file has correct URL
- For physical device, use local IP instead of localhost

**Fonts not loading:**
- Check internet connection (fonts loaded from Google)
- Clear app cache and restart

**Tab navigation not showing:**
- Ensure user is logged in
- Check user role in profile

## License

MIT
