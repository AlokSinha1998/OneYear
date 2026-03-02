import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppNavigation from './src/navigation/stacknavigation/AppNavigation'
import { ThemeProvider } from './src/context/ThemeContext'

const App = () => {
  return (
    <ThemeProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <AppNavigation />
      </SafeAreaView>
    </ThemeProvider>
  )
}

export default App