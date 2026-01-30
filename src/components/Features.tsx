import { useState, useEffect, useRef } from "react"
import { Smartphone, Target, Zap, CreditCard, TrendingUp, Gift, Check, Clock, Activity, ChevronDown, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Smartphone,
    title: "Rewards That Move With You",
    description: "Earn rewards shaped by your spending behavior, fueling progress toward your personal ambitions.",
    reverse: false
  },
  {
    icon: Zap,
    title: "Unlock Smarter Spending Moments",
    description: "Access personalized merchant offers layered on top of your core rewards, automatically and effortlessly.",
    reverse: true
  },
  {
    icon: Target,
    title: "Goals That Actually Go Somewhere",
    description: "Set a new goal every quarter and see real-world impact as your card adapts to help you achieve it.",
    reverse: false
  }
]

// Enhanced Phone mockup component for Feature 1 - 5-second animation sequence
const AdaptiveRewardsPhone = ({ isVisible }: { isVisible: boolean }) => {
  const [animationPhase, setAnimationPhase] = useState(0)
  const [buttonState, setButtonState] = useState<'idle' | 'pressed' | 'processing' | 'applied'>('idle')
  const [showDropdown, setShowDropdown] = useState(false)
  
  useEffect(() => {
    if (!isVisible) {
      setAnimationPhase(0)
      setButtonState('idle')
      setShowDropdown(false)
      return
    }
    
    // 5-second animation sequence
    const sequence = [
      // Phase 0: Checkout screen (0-2s)
      { phase: 0, duration: 0 },
      
      // Button interaction sequence
      { phase: 0, duration: 500, action: () => setButtonState('pressed') },
      { phase: 0, duration: 800, action: () => setButtonState('processing') },
      { phase: 0, duration: 1500, action: () => setButtonState('applied') },
      
      // Phase 1: Screen transition (2-2.5s)
      { phase: 1, duration: 2000 },
      
      // Phase 2: Transactions screen (2.5-5s)
      { phase: 2, duration: 2500 },
      { phase: 2, duration: 3500, action: () => setShowDropdown(true) },
      
      // Loop back
      { phase: 0, duration: 5000, action: () => {
        setButtonState('idle')
        setShowDropdown(false)
      }}
    ]
    
    sequence.forEach(({ phase, duration, action }) => {
      const timeout = setTimeout(() => {
        setAnimationPhase(phase)
        if (action) action()
      }, duration)
      
      return () => clearTimeout(timeout)
    })
    
    // Set up looping
    const loopInterval = setInterval(() => {
      setAnimationPhase(0)
      setButtonState('idle')
      setShowDropdown(false)
      
      sequence.forEach(({ phase, duration, action }) => {
        const timeout = setTimeout(() => {
          setAnimationPhase(phase)
          if (action) action()
        }, duration)
        
        return () => clearTimeout(timeout)
      })
    }, 5000)
    
    return () => clearInterval(loopInterval)
  }, [isVisible])

  const getButtonContent = () => {
    switch (buttonState) {
      case 'pressed':
        return "Pay with Ventus Card"
      case 'processing':
        return "Processing..."
      case 'applied':
        return (
          <div className="flex items-center justify-center">
            <Check className="w-4 h-4 mr-2" />
            Reward Applied
          </div>
        )
      default:
        return "Pay with Ventus Card"
    }
  }

  const getButtonClasses = () => {
    const baseClasses = "w-full text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200"
    
    switch (buttonState) {
      case 'pressed':
        return `${baseClasses} bg-gray-700 transform scale-95`
      case 'processing':
        return `${baseClasses} bg-blue-600`
      case 'applied':
        return `${baseClasses} bg-green-600`
      default:
        return `${baseClasses} bg-black hover:bg-gray-800`
    }
  }

  return (
    <div className="relative mx-auto w-64 h-[500px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
      <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
        {/* Phase 0: Checkout Screen */}
        {animationPhase === 0 && (
          <div className={`p-3 pt-8 flex-1 transition-all duration-500 flex flex-col min-h-0 ${
            animationPhase === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
          }`}>
            {/* Header */}
            <div className="text-center mb-3 flex-shrink-0">
              <h4 className="font-bold text-sm mb-1">Tennis Warehouse</h4>
              <p className="text-xs text-gray-600">Checkout</p>
            </div>
            
            {/* Product */}
            <div className="bg-gray-50 p-3 rounded-xl mb-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🎾</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs">Wilson Pro Staff</div>
                  <div className="text-xs text-gray-600">Tennis Racquet</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-sm">$189.99</div>
                </div>
              </div>
            </div>
            
            {/* 5x Rewards Banner */}
            <div className={`bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-xl text-white mb-3 flex-shrink-0 transition-all duration-300 ${
              buttonState === 'applied' ? 'ring-2 ring-green-300 shadow-lg shadow-green-200' : ''
            }`}>
              <div className="flex items-center justify-center mb-1">
                <Check className="w-3 h-3 mr-1" />
                <span className="font-bold text-sm">5x Rewards</span>
              </div>
              <div className="text-center text-xs opacity-90 leading-relaxed">
                Becoming more athletic in sports
              </div>
            </div>
            
            {/* Pay Button */}
            <div className="mt-auto flex-shrink-0">
              <button className={getButtonClasses()}>
                {getButtonContent()}
              </button>
            </div>
          </div>
        )}
        
        {/* Phase 1: Transition */}
        {animationPhase === 1 && (
          <div className="p-3 pt-8 flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-xs text-gray-600">Loading transactions...</div>
            </div>
          </div>
        )}
        
        {/* Phase 2: Enhanced Transactions Screen */}
        {animationPhase === 2 && (
          <div className={`p-3 pt-8 flex-1 transition-all duration-500 flex flex-col min-h-0 ${
            animationPhase === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
          }`}>
            {/* Header */}
            <div className="text-center mb-4 flex-shrink-0">
              <h4 className="font-bold text-sm mb-1">Recent Transactions</h4>
              <p className="text-xs text-gray-600">This Week</p>
            </div>
            
            {/* Featured Tennis Purchase with 5x */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 p-3 rounded-xl mb-4 flex-shrink-0 animate-[fadeIn_0.5s_ease-out] shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="text-sm flex-shrink-0">🎾</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs leading-tight">Tennis Warehouse</div>
                    <div className="text-xs text-gray-600 leading-tight">Sports Equipment</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-bold text-green-600 text-sm animate-[pulse_1s_ease-in-out_2] leading-tight">+950 pts</div>
                  <div className="text-xs bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-0.5 rounded-full mt-1 font-bold">5x</div>
                </div>
              </div>
            </div>
            
            {/* Premium divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3 flex-shrink-0"></div>
            
            {/* Collapsible Other Transactions */}
            <div className="flex-shrink-0">
              <button 
                className="w-full bg-white border border-gray-200 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 mb-2 shadow-sm text-left"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-800">Other Transactions</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">2 items</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform duration-200 flex-shrink-0 ml-1 ${
                    showDropdown ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              
              {/* Dropdown Content */}
              <div className={`overflow-hidden transition-all duration-300 ${
                showDropdown ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="bg-gray-50 rounded-xl p-2 space-y-2">
                  <div className="bg-white border border-gray-200 p-2 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-sm flex-shrink-0">☕</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs leading-tight">Starbucks</div>
                          <div className="text-xs text-gray-600 leading-tight">Coffee</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-semibold text-gray-700 text-xs leading-tight">+5 pts</div>
                        <div className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full mt-0.5">1x</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 p-2 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-sm flex-shrink-0">🛒</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs leading-tight">Whole Foods</div>
                          <div className="text-xs text-gray-600 leading-tight">Groceries</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-semibold text-gray-700 text-xs leading-tight">+12 pts</div>
                        <div className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full mt-0.5">1x</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Phone mockup component for Feature 2 - Merchant Offers
const MerchantOffersPhone = ({ isVisible }: { isVisible: boolean }) => {
  const [currentPhase, setCurrentPhase] = useState(0)
  
  useEffect(() => {
    if (!isVisible) return
    
    // Reset animation when becoming visible
    setCurrentPhase(0)
    
    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev === 1 ? 0 : prev + 1)) // Loop between 0 and 1
    }, 2500) // Switch every 2.5 seconds
    
    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <div className="relative mx-auto w-64 h-[500px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
      <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
        {/* Phase 1: Recent Transactions */}
        {currentPhase === 0 && (
          <div className="p-3 pt-8 flex-1 transition-all duration-500 flex flex-col min-h-0">
            {/* Header */}
            <div className="text-center mb-3 flex-shrink-0">
              <h4 className="font-bold text-sm mb-1">Recent Transactions</h4>
              <p className="text-xs text-gray-600">This Week</p>
            </div>
            
            {/* Tennis Purchase with 5x - clickable indicator */}
            <div className="bg-green-50 border-2 border-green-200 p-3 rounded-xl mb-3 flex-shrink-0 cursor-pointer hover:bg-green-100 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="text-sm flex-shrink-0">🎾</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs">Tennis Warehouse</div>
                    <div className="text-xs text-gray-600">Sports Equipment</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-bold text-green-600 text-xs">+950 pts</div>
                  <div className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded mt-0.5">5x</div>
                </div>
              </div>
            </div>
            
            {/* Other purchases */}
            <div className="space-y-2 mb-3 flex-shrink-0">
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-sm flex-shrink-0">☕</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs">Starbucks</div>
                      <div className="text-xs text-gray-600">Coffee</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-bold text-gray-600 text-xs">+5 pts</div>
                    <div className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded mt-0.5">1x</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-sm flex-shrink-0">🛒</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs">Whole Foods</div>
                      <div className="text-xs text-gray-600">Groceries</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-bold text-gray-600 text-xs">+12 pts</div>
                    <div className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded mt-0.5">1x</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Updated CTA */}
            <div className="mt-auto text-center flex-shrink-0">
              <div className="text-xs text-blue-600 font-medium animate-pulse">
                Tap for personalized offers →
              </div>
            </div>
          </div>
        )}
        
        {/* Phase 2: Exclusive Wilson Offer */}
        {currentPhase === 1 && (
          <div className="p-3 pt-8 flex-1 transition-all duration-500 flex flex-col min-h-0">
            {/* Header */}
            <div className="text-center mb-3 flex-shrink-0">
              <h4 className="font-bold text-sm mb-1">Exclusive Offer</h4>
              <p className="text-xs text-gray-600">Based on your purchase</p>
            </div>
            
            {/* Condensed Transaction Reference */}
            <div className="bg-gray-50 p-2 rounded-xl mb-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm flex-shrink-0">🎾</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs">Tennis Warehouse</div>
                  <div className="text-xs text-gray-600">+950 pts earned</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-xs">$189.99</div>
                </div>
              </div>
            </div>
            
            {/* Offer Card */}
            <div className="flex-1 flex flex-col justify-center min-h-0 max-h-full">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl text-white shadow-lg animate-[slideUp_0.5s_ease-out]">
                <div className="flex items-center mb-2">
                  <Gift className="w-3 h-3 mr-1" />
                  <span className="font-semibold text-xs">Exclusive Offer</span>
                </div>
                
                <div className="mb-2">
                  <div className="text-sm font-bold mb-1">$20 off your next Wilson order</div>
                  <div className="text-xs opacity-90 flex items-center">
                    <Clock className="w-2 h-2 mr-1" />
                    Expires in 4 hours
                  </div>
                </div>
                
                {/* Offer details */}
                <div className="space-y-1 mb-2 text-xs opacity-90">
                  <div className="flex items-center">
                    <Check className="w-2 h-2 mr-1 flex-shrink-0" />
                    <span className="text-xs">Triggered by your Tennis purchase</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-2 h-2 mr-1 flex-shrink-0" />
                    <span className="text-xs">Limited-time offer</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <button className="w-full bg-white text-indigo-600 py-1.5 rounded-lg font-semibold text-xs hover:bg-gray-50 transition-colors">
                  Add Offer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Phone mockup component for Feature 3 - Goals Progress
const GoalsProgressPhone = ({ isVisible }: { isVisible: boolean }) => {
  const [progress, setProgress] = useState(0)
  
  // Single goal only
  const goal = { title: "Becoming more athletic in sports", target: 2500, current: 0 }

  useEffect(() => {
    if (!isVisible) return
    
    // Reset animation when becoming visible
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0 // Reset to 0 to loop
        }
        return prev + 10
      })
    }, 200)
    
    return () => clearInterval(interval)
  }, [isVisible])

  const currentAmount = Math.floor((goal.target * progress) / 100)

  return (
    <div className="relative mx-auto w-64 h-[500px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
      <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
        {/* Goals content */}
        <div className="p-3 pt-8">
          <h4 className="font-bold text-sm mb-4 text-center">Reward Summary</h4>
          
          {/* Added top padding (20px = pt-5) above the card */}
          <div className="pt-5">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-6 rounded-xl">
              {/* Q2 Goal label */}
              <div className="text-xs text-gray-500 font-medium mb-1">Q2 Goal</div>
              
              {/* Enhanced goal title with increased font size and weight */}
              <div className="flex items-center mb-4">
                <Activity className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-bold text-sm leading-tight">Becoming more athletic in sports</span>
              </div>
              
              {/* Progress circle with enhanced styling */}
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle with lighter grey */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10"/>
                  {/* Progress circle with thicker stroke */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="transition-all duration-200"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-600">{Math.round(progress)}%</div>
                  </div>
                </div>
              </div>
              
              {/* Amount display */}
              <div className="text-center">
                <div className="text-lg font-bold">${currentAmount.toLocaleString()}</div>
                <div className="text-xs text-gray-600">of ${goal.target.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Features = () => {
  const [visibleFeatures, setVisibleFeatures] = useState<boolean[]>([false, false, false])
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const scrollPosition = window.scrollY

      featureRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect()
          const elementTop = rect.top + scrollPosition
          const elementBottom = elementTop + rect.height
          
          // Check if the element is in the viewport (with some buffer)
          const isInViewport = 
            elementTop < scrollPosition + windowHeight * 0.8 && 
            elementBottom > scrollPosition + windowHeight * 0.2

          setVisibleFeatures(prev => {
            const newState = [...prev]
            newState[index] = isInViewport
            return newState
          })
        }
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const renderPhoneMockup = (index: number) => {
    switch (index) {
      case 0:
        return <AdaptiveRewardsPhone isVisible={visibleFeatures[index]} />
      case 1:
        return <MerchantOffersPhone isVisible={visibleFeatures[index]} />
      case 2:
        return <GoalsProgressPhone isVisible={visibleFeatures[index]} />
      default:
        return null
    }
  }

  return (
    <section id="features" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {features.map((feature, index) => (
          <div
            key={index}
            ref={el => featureRefs.current[index] = el}
            className={`relative overflow-hidden transition-all duration-1000 ease-out ${
              visibleFeatures[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            } ${index > 0 ? 'mt-16 md:mt-20 lg:mt-24' : ''}`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            {/* Content container with reduced padding */}
            <div className="py-8 md:py-12 lg:py-16 px-6 md:px-8 lg:px-12">
              <div className={`grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center ${
                feature.reverse ? 'lg:grid-flow-col-dense' : ''
              }`}>
                
                {/* Content */}
                <div className={`space-y-4 md:space-y-6 ${feature.reverse ? 'lg:col-start-2' : ''}`}>
                  <h3 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                    {feature.description}
                  </p>
                  
                  {/* Add "See How It Works" button only for the first feature */}
                  {index === 0 && (
                    <div className="pt-2">
                      <Link to="/onboarding">
                        <Button
                          variant="outline"
                          className="bg-white border-[#D0D5DD] text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          See How It Works
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Phone mockup visual */}
                <div className={`${feature.reverse ? 'lg:col-start-1' : ''}`}>
                  <div className="flex justify-center">
                    {renderPhoneMockup(index)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features
