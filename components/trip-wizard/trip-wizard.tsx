'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarDays, DollarSign, User, Heart, ArrowRight, ArrowLeft } from 'lucide-react'
import StepIndicator from './step-indicator'
import { PERSONA_OPTIONS } from '@/lib/types'

export interface TripFormData {
  title: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  persona: string
  interests: {
    culture: boolean
    food: boolean
    nature: boolean
    shopping: boolean
    nightlife: boolean
  }
}

interface TripWizardProps {
  onComplete: (data: TripFormData) => void
}

const STEPS = ['Trip Details', 'Budget', 'Travel Style', 'Interests']

export default function TripWizard({ onComplete }: TripWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<TripFormData>({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0,
    persona: '',
    interests: {
      culture: false,
      food: false,
      nature: false,
      shopping: false,
      nightlife: false
    }
  })

  const updateFormData = (field: keyof TripFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateInterests = (interest: keyof TripFormData['interests'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        [interest]: checked
      }
    }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onComplete(formData)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.destination && formData.startDate && formData.endDate
      case 1:
        return formData.budget > 0
      case 2:
        return formData.persona
      case 3:
        return Object.values(formData.interests).some(Boolean)
      default:
        return false
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Plan Your Dream Trip</CardTitle>
          <StepIndicator
            currentStep={currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
          />
        </CardHeader>
        <CardContent className="min-h-96">
          {/* Step 1: Trip Details */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Trip Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Trip Name</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Summer Adventure in Japan"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Tokyo, Japan"
                    value={formData.destination}
                    onChange={(e) => updateFormData('destination', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateFormData('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateFormData('endDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Budget</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget">Total Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 2000"
                    value={formData.budget || ''}
                    onChange={(e) => updateFormData('budget', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    This includes accommodation, food, activities, and transportation
                  </p>
                </div>
                
                {/* Budget suggestions */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateFormData('budget', 1000)}
                    className="h-auto p-4"
                  >
                    <div className="text-center">
                      <div className="font-semibold">$1,000</div>
                      <div className="text-sm text-gray-600">Budget Trip</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateFormData('budget', 3000)}
                    className="h-auto p-4"
                  >
                    <div className="text-center">
                      <div className="font-semibold">$3,000</div>
                      <div className="text-sm text-gray-600">Comfort Trip</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Travel Style */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Travel Style</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>What type of traveler are you?</Label>
                  <Select value={formData.persona} onValueChange={(value) => updateFormData('persona', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your travel style" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONA_OPTIONS.map((persona) => (
                        <SelectItem key={persona.value} value={persona.value}>
                          <div>
                            <div className="font-medium">{persona.label}</div>
                            <div className="text-sm text-gray-600">{persona.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Interests */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Interests</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>What are you most interested in? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {Object.entries(formData.interests).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => 
                            updateInterests(key as keyof TripFormData['interests'], checked as boolean)
                          }
                        />
                        <Label htmlFor={key} className="capitalize">
                          {key === 'nightlife' ? 'Nightlife' : key}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            
            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className="flex items-center space-x-2"
              >
                <span>Create Trip</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 