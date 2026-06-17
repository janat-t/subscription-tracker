import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Settings, Monitor, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const CURRENCIES = ['USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','INR','THB']

export default function SettingsDialog({ currency, onChangeCurrency }: { currency: string; onChangeCurrency: (currency: string) => void }) {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Settings className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Theme</p>
            <div className="flex gap-2">
              <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4 mr-1" /> Light
              </Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4 mr-1" /> Dark
              </Button>
              <Button variant={theme === 'system' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('system')}>
                <Monitor className="h-4 w-4 mr-1" /> System
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Currency</p>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map((c) => (
                <Button
                  key={c}
                  variant={c === currency ? 'default' : 'outline'}
                  onClick={() => { onChangeCurrency(c); setOpen(false) }}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
