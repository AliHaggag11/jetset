'use client'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme-provider'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { subscriptionService } from '@/lib/subscriptionService'
import { subscriptionManager } from '@/lib/subscriptionManager'
import { 
  Crown, 
  Zap, 
  Plane, 
  LogOut, 
  Camera, 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  AlertTriangle,
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Download,
  Smartphone
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type TabType = 'profile' | 'settings' | 'subscription' | 'security' | 'danger'

export default function ProfilePage() {
  const { user, session, loading, signOut } = useAuth()
  const { theme: currentTheme, setTheme: setCurrentTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [plan, setPlan] = useState<'free' | 'explorer' | 'adventurer'>('free')
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [autoRenewal, setAutoRenewal] = useState(true)
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Plan change confirmation state
  const [showPlanConfirm, setShowPlanConfirm] = useState(false)
  const [pendingPlanChange, setPendingPlanChange] = useState<'free' | 'explorer' | 'adventurer' | null>(null)

  // Settings state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(currentTheme)
  const [language, setLanguage] = useState('en')
  const [notifications, setNotifications] = useState({
    email: true,
    product: true,
    marketing: false
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSuccess, setSettingsSuccess] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  // Security state
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Danger zone state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      setEmail(user.email || '')
      fetchProfile()
      fetchPlan()
      fetchSettings()
    }
    // eslint-disable-next-line
  }, [user, loading])

  const fetchProfile = async () => {
    if (user) {
      const profile = await subscriptionService.getUserProfile(user.id)
      setFirstName(profile?.first_name || '')
      setLastName(profile?.last_name || '')
      setProfileImage(profile?.profile_image_url || null)
      setPreviewImage(null)
    }
  }

  const fetchPlan = async () => {
    if (user) {
      const sub = await subscriptionService.getUserSubscription(user.id)
      setPlan(sub?.plan || 'free')
      
      // Get detailed subscription info including period and auto-renewal
      const detailedSub = await subscriptionManager.getCurrentSubscription(user.id)
      if (detailedSub) {
        setPeriod(detailedSub.period || 'monthly')
        setAutoRenewal(detailedSub.auto_renewal ?? true)
        setSubscriptionEndDate(detailedSub.current_period_end)
      }
    }
  }

  const fetchSettings = async () => {
    if (user && session) {
      try {
        const response = await fetch('/api/profile/settings', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          const savedTheme = data.theme || 'system'
          setTheme(savedTheme)
          setCurrentTheme(savedTheme) // Sync with theme context
          setLanguage(data.language || 'en')
          setNotifications(data.notifications || {
            email: true,
            product: true,
            marketing: false
          })
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }
  }

  const getPlanIcon = () => {
    switch (plan) {
      case 'adventurer':
        return <Crown className="w-5 h-5 text-purple-600" />
      case 'explorer':
        return <Zap className="w-5 h-5 text-blue-600" />
      default:
        return <Plane className="w-5 h-5 text-gray-500" />
    }
  }

  const getPlanColor = () => {
    switch (plan) {
      case 'adventurer':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'explorer':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPlanName = () => {
    switch (plan) {
      case 'adventurer':
        return 'Adventurer'
      case 'explorer':
        return 'Explorer'
      default:
        return 'Free'
    }
  }

  const getInitials = (email: string) => {
    if (!email) return 'U'
    const [name] = email.split('@')
    return name
      .split(/[._-]/)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleImageUpload = async (): Promise<string | undefined> => {
    if (!profileImageFile || !user) return undefined
    const fileExt = profileImageFile.name.split('.').pop()
    const filePath = `profile-images/${user.id}.${fileExt}`
    const { error } = await supabase.storage.from('profile-images').upload(filePath, profileImageFile, { upsert: true })
    if (error) {
      setError('Failed to upload image')
      return undefined
    }
    const { data } = supabase.storage.from('profile-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      let imageUrl: string | undefined = profileImage || undefined
      if (profileImageFile) {
        imageUrl = await handleImageUpload()
        setProfileImage(imageUrl || null)
        setPreviewImage(null)
      }
      if (!user) throw new Error('Not authenticated')
      await subscriptionService.updateUserProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        profile_image_url: imageUrl ?? undefined
      })
      setSuccess(true)
      setProfileImageFile(null)
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      setChangingPassword(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      setChangingPassword(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setPasswordError(error.message)
      } else {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }



  const handleSignOutAll = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err: any) {
      setError('Failed to sign out from all devices')
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    setSettingsError(null)
    setSettingsSuccess(false)
    
    try {
      const response = await fetch('/api/profile/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          theme,
          language,
          notifications
        })
      })

      if (response.ok) {
        setSettingsSuccess(true)
        setTimeout(() => setSettingsSuccess(false), 3000)
      } else {
        const error = await response.json()
        setSettingsError(error.error || 'Failed to save settings')
      }
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/profile/export-data', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `jetset-data-${user?.id}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        setError('Failed to export data')
      }
    } catch (err: any) {
      setError('Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setPasswordError('Please type DELETE to confirm')
      return
    }
    setDeleting(true)
    try {
      const response = await fetch('/api/profile/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      })
      if (response.ok) {
        await signOut()
        router.push('/')
      } else {
        const data = await response.json()
        setPasswordError(data.error || 'Failed to delete account')
      }
    } catch (error) {
      setPasswordError('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  // Subscription management functions
  const handleUpdatePeriod = async (newPeriod: 'monthly' | 'annual') => {
    if (!user) return
    
    try {
      const response = await fetch('/api/subscription/update-period', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          period: newPeriod
        }),
      })

      if (response.ok) {
        setPeriod(newPeriod)
        // Refresh subscription data
        await fetchPlan()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update billing period')
      }
    } catch (error) {
      setError('Failed to update billing period')
    }
  }

  const handleToggleAutoRenewal = async (enabled: boolean) => {
    if (!user) return
    
    try {
      const response = await fetch('/api/subscription/toggle-auto-renewal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          autoRenewal: enabled
        }),
      })

      if (response.ok) {
        setAutoRenewal(enabled)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update auto-renewal')
      }
    } catch (error) {
      setError('Failed to update auto-renewal')
    }
  }

  const handleChangePlan = async (newPlan: 'free' | 'explorer' | 'adventurer') => {
    if (!user) return
    
    // Check if this is a downgrade
    const planOrder = getPlanOrder()
    const currentIndex = planOrder.indexOf(plan)
    const newIndex = planOrder.indexOf(newPlan)
    
    if (newIndex < currentIndex) {
      // This is a downgrade - show confirmation
      setPendingPlanChange(newPlan)
      setShowPlanConfirm(true)
      return
    }
    
    // This is an upgrade or same plan - proceed immediately
    await performPlanChange(newPlan)
  }

  const performPlanChange = async (newPlan: 'free' | 'explorer' | 'adventurer') => {
    if (!user) return
    
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: newPlan,
          userId: user.id,
          period: period,
          autoRenewal: autoRenewal
        }),
      })

      if (response.ok) {
        setPlan(newPlan)
        // Refresh subscription data
        await fetchPlan()
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to change plan')
      }
    } catch (error) {
      setError('Failed to change plan')
    }
  }

  const confirmPlanChange = async () => {
    if (pendingPlanChange) {
      await performPlanChange(pendingPlanChange)
      setShowPlanConfirm(false)
      setPendingPlanChange(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCurrentPrice = () => {
    if (plan === 'free') return 'Free'
    return subscriptionManager.getFormattedPrice(plan, period)
  }

  const getPlanOrder = () => {
    return ['free', 'explorer', 'adventurer']
  }

  const getActionLabel = (targetPlan: 'free' | 'explorer' | 'adventurer') => {
    const planOrder = getPlanOrder()
    const currentIndex = planOrder.indexOf(plan)
    const targetIndex = planOrder.indexOf(targetPlan)
    
    if (targetIndex > currentIndex) return 'Upgrade'
    if (targetIndex < currentIndex) return 'Downgrade'
    return 'Current Plan'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ]

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSave}>
                    <div className="flex items-center space-x-6 mb-6">
                      <div className="relative">
                        <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          {previewImage ? (
                            <img src={previewImage} alt="Profile Preview" className="object-cover w-full h-full rounded-full" />
                          ) : profileImage ? (
                            <img src={profileImage} alt="Profile" className="object-cover w-full h-full rounded-full" />
                          ) : (
                            <AvatarFallback className="text-2xl bg-gray-200 text-gray-700">{getInitials(email)}</AvatarFallback>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                          />
                          <span className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md">
                            <Camera className="w-4 h-4 text-blue-600" />
                          </span>
                        </Avatar>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{firstName && lastName ? `${firstName} ${lastName}` : email}</h3>
                        <Badge variant="outline" className={`mt-2 ${getPlanColor()}`}>
                          {getPlanIcon()}<span className="ml-2">{getPlanName()} Plan</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last Name"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="mt-6">
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>

                    {success && <div className="text-green-600 text-sm mt-2">Profile updated successfully!</div>}
                    {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive updates about your trips and account</p>
                      </div>
                      <Checkbox
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked as boolean }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Product Updates</Label>
                        <p className="text-sm text-gray-600">Get notified about new features and improvements</p>
                      </div>
                      <Checkbox
                        checked={notifications.product}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, product: checked as boolean }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Marketing Emails</Label>
                        <p className="text-sm text-gray-600">Receive promotional content and special offers</p>
                      </div>
                      <Checkbox
                        checked={notifications.marketing}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked as boolean }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Moon className="w-5 h-5" />
                      <span>Appearance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => {
                        setTheme(value)
                        setCurrentTheme(value) // Apply theme immediately
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center space-x-2">
                              <Sun className="w-4 h-4" />
                              <span>Light</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center space-x-2">
                              <Moon className="w-4 h-4" />
                              <span>Dark</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center space-x-2">
                              <Settings className="w-4 h-4" />
                              <span>System</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={savingSettings}
                    className="min-w-[120px]"
                  >
                    {savingSettings ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>

                {settingsSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">Settings saved successfully!</p>
                  </div>
                )}
                {settingsError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{settingsError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Current Plan</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getPlanIcon()}
                          <div>
                            <h3 className="font-semibold">{getPlanName()} Plan</h3>
                            <p className="text-sm text-gray-600">
                              {plan === 'free' ? 'Basic features included' : 
                               plan === 'explorer' ? 'Enhanced features with priority support' : 
                               'All features with premium support'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{getCurrentPrice()}</div>
                          {plan !== 'free' && (
                            <div className="text-sm text-gray-600">
                              {period === 'annual' ? 'Billed annually' : 'Billed monthly'}
                            </div>
                          )}
                        </div>
                      </div>

                      {plan !== 'free' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="plan-tier">Plan Tier</Label>
                              <Select value={plan} onValueChange={(value: 'free' | 'explorer' | 'adventurer') => handleChangePlan(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Free Plan</SelectItem>
                                  <SelectItem value="explorer">Explorer Plan</SelectItem>
                                  <SelectItem value="adventurer">Adventurer Plan</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-gray-500 mt-1">
                                {getActionLabel(plan)} • {getCurrentPrice()}
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="billing-period">Billing Period</Label>
                              <Select value={period} onValueChange={(value: 'monthly' | 'annual') => handleUpdatePeriod(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="annual">Annual (Save 17%)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Auto-Renewal</Label>
                            <div className="flex items-center space-x-2 mt-2">
                              <Checkbox
                                id="auto-renewal"
                                checked={autoRenewal}
                                onCheckedChange={(checked) => handleToggleAutoRenewal(checked as boolean)}
                              />
                              <Label htmlFor="auto-renewal" className="text-sm">
                                Automatically renew my subscription
                              </Label>
                            </div>
                          </div>
                        </>
                      )}

                      {plan === 'free' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="plan-tier">Plan Tier</Label>
                            <Select value={plan} onValueChange={(value: 'free' | 'explorer' | 'adventurer') => handleChangePlan(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free">Free Plan</SelectItem>
                                <SelectItem value="explorer">Explorer Plan</SelectItem>
                                <SelectItem value="adventurer">Adventurer Plan</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              {getActionLabel(plan)} • {getCurrentPrice()}
                            </p>
                          </div>
                          <div className="flex items-end">
                            <Button 
                              variant="outline" 
                              onClick={() => router.push('/pricing')}
                              className="w-full"
                            >
                              View All Plans
                            </Button>
                          </div>
                        </div>
                      )}

                      {subscriptionEndDate && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Next billing date: {formatDate(subscriptionEndDate)}
                            </span>
                          </div>
                          {!autoRenewal && (
                            <p className="text-xs text-blue-600 mt-1">
                              Your subscription will not automatically renew
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">Subscription updated successfully!</p>
                  </div>
                )}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {plan === 'free' ? '1' : plan === 'explorer' ? '5' : '∞'}
                        </div>
                        <div className="text-sm text-gray-600">Trips per month</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {plan === 'free' ? '1' : '∞'}
                        </div>
                        <div className="text-sm text-gray-600">Regenerations per trip</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {plan === 'free' ? '3' : plan === 'explorer' ? '30' : '∞'}
                        </div>
                        <div className="text-sm text-gray-600">Max trip days</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No billing history available</p>
                      <p className="text-sm">Billing history will appear here once you upgrade to a paid plan</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lock className="w-5 h-5" />
                      <span>Change Password</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button type="submit" disabled={changingPassword}>
                        {changingPassword ? 'Changing Password...' : 'Change Password'}
                      </Button>
                      {passwordSuccess && <div className="text-green-600 text-sm">Password changed successfully!</div>}
                      {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Smartphone className="w-5 h-5" />
                      <span>Active Sessions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-600">Windows • Chrome • {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </div>
                      <Button variant="outline" onClick={handleSignOutAll} className="w-full">
                        Sign Out from All Devices
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Two-factor authentication not available</p>
                      <p className="text-sm">This feature will be available in a future update</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Danger Zone</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Delete Account</h3>
                    <p className="text-red-700 text-sm mb-4">
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </p>
                    
                    {!showDeleteConfirm ? (
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="deleteConfirm" className="text-red-800">
                            Type "DELETE" to confirm
                          </Label>
                          <Input
                            id="deleteConfirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="border-red-300"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                          >
                            {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowDeleteConfirm(false)
                              setDeleteConfirmText('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Export Data</h3>
                    <p className="text-yellow-700 text-sm mb-4">
                      Download a copy of your data before deleting your account.
                    </p>
                    <Button variant="outline" className="text-yellow-700 border-yellow-300" onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export My Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Plan Change Confirmation Modal */}
      {showPlanConfirm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Confirm Plan Downgrade</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to downgrade to the {pendingPlanChange ? pendingPlanChange.charAt(0).toUpperCase() + pendingPlanChange.slice(1) : ''} plan? 
              You may lose access to premium features.
            </p>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPlanConfirm(false)
                  setPendingPlanChange(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmPlanChange}
                className="flex-1"
              >
                Confirm Downgrade
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 