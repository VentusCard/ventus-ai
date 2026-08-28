
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
		// Font Families - DM Sans as primary
		fontFamily: {
			sans: ['"Manrope"', 'system-ui', '-apple-system', 'sans-serif'],
				display: ['"Manrope"', 'system-ui', 'sans-serif'],
				mono: ['"DM Mono"', 'SF Mono', 'Monaco', 'monospace'],
			},

			// Background Images & Gradients
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'metallic-gradient': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 20%, #cbd5e1 40%, #94a3b8 60%, #64748b 80%, #475569 100%)',
				'blue-metallic': 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 20%, #93c5fd 40%, #60a5fa 60%, #3b82f6 80%, #1d4ed8 100%)',
				'titanium-surface': 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 50%, rgba(226, 232, 240, 0.95) 100%)',
			},

			// Colors
			colors: {
				// Core Shadcn Colors
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},

				// Custom Colors
				'blue-gray': {
					300: '#94a3b8',
					400: '#64748b',
					500: '#475569',
				},
				'metallic': {
					silver: 'hsl(var(--metallic-silver))',
					platinum: 'hsl(var(--metallic-platinum))',
					titanium: 'hsl(var(--metallic-titanium))',
					steel: 'hsl(var(--metallic-steel))',
				},
			},

			// Border Radius
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},

			// Box Shadows
			boxShadow: {
				'metallic': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
				'premium': '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
				'titanium': '0 4px 24px rgba(148, 163, 184, 0.15), 0 2px 8px rgba(148, 163, 184, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
			},

			// Backdrop Blur
			backdropBlur: {
				'premium': '20px',
			},

			// Keyframes
			keyframes: {
				'rollup': {
					from: { transform: 'translateY(110%)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				// Accordion Animations
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},

				// Collapsible Animations
				'collapsible-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-collapsible-content-height)' }
				},
				'collapsible-up': {
					from: { height: 'var(--radix-collapsible-content-height)' },
					to: { height: '0' }
				},

				// Enhanced Entrance Animations
				'unleashed': {
					'0%': { transform: 'scale(0.98) translateY(3px)', opacity: '0' },
					'100%': { transform: 'scale(1) translateY(0)', opacity: '1' }
				},
				'fadeUpSoft': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slideUp': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},

				// Brushstroke Animations
				'brushstroke': {
					'0%': { transform: 'scaleX(1)', 'transform-origin': 'left' },
					'100%': { transform: 'scaleX(0)', 'transform-origin': 'right' }
				},
				'brushstroke-draw': {
					'0%': { opacity: '0', transform: 'scaleX(0)', 'transform-origin': 'left' },
					'20%': { opacity: '1' },
					'100%': { opacity: '1', transform: 'scaleX(1)', 'transform-origin': 'left' }
				},

			// Movement Animations
			'float': {
				'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
				'33%': { transform: 'translateY(-8px) rotate(0.5deg)' },
				'66%': { transform: 'translateY(-4px) rotate(-0.5deg)' }
			},
			'float-slow': {
				'0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
				'25%': { transform: 'translateY(-12px) translateX(5px)' },
				'50%': { transform: 'translateY(-20px) translateX(0px)' },
				'75%': { transform: 'translateY(-12px) translateX(-5px)' }
			},
			'pulse-glow': {
				'0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
				'50%': { opacity: '1', transform: 'scale(1.15)' }
			},
			'draw-line': {
				'0%': { strokeDashoffset: '200', opacity: '0' },
				'15%': { opacity: '0.5' },
				'100%': { strokeDashoffset: '0', opacity: '1' }
			},
			'fade-float': {
				'0%': { opacity: '0', transform: 'translateY(30px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' }
			},
			'ripple': {
				'0%': { transform: 'scale(0.8)', opacity: '0.6' },
				'50%': { transform: 'scale(1.5)', opacity: '0.3' },
				'100%': { transform: 'scale(2)', opacity: '0' }
			},
			'particle-drift': {
				'0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0.2' },
				'25%': { transform: 'translateY(-30px) translateX(15px)', opacity: '0.5' },
				'50%': { transform: 'translateY(-50px) translateX(-10px)', opacity: '0.3' },
				'75%': { transform: 'translateY(-20px) translateX(20px)', opacity: '0.5' }
			},
			'morph-slow': {
				'0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'rotate(0deg) scale(1)' },
				'25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', transform: 'rotate(5deg) scale(1.05)' },
				'50%': { borderRadius: '50% 60% 30% 60% / 30% 70% 50% 60%', transform: 'rotate(-5deg) scale(0.98)' },
				'75%': { borderRadius: '60% 40% 60% 40% / 70% 30% 50% 60%', transform: 'rotate(3deg) scale(1.02)' }
			},
			'color-shift': {
				'0%, 100%': { backgroundPosition: '0% 50%' },
				'50%': { backgroundPosition: '100% 50%' }
			},
			'bounce': {
				'0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
				'40%': { transform: 'translateY(-8px)' },
				'60%': { transform: 'translateY(-4px)' }
			},

			// Gradient Background Animations
			'gradient-rotate': {
				'0%': { transform: 'rotate(0deg) scale(1.5)' },
				'100%': { transform: 'rotate(360deg) scale(1.5)' }
			},
			'gradient-rotate-reverse': {
				'0%': { transform: 'rotate(360deg) scale(1.6)' },
				'100%': { transform: 'rotate(0deg) scale(1.6)' }
			},
			'aurora-wave': {
				'0%': { transform: 'translateY(0px) translateX(0px)' },
				'25%': { transform: 'translateY(-30px) translateX(20px)' },
				'50%': { transform: 'translateY(10px) translateX(-10px)' },
				'75%': { transform: 'translateY(-20px) translateX(15px)' },
				'100%': { transform: 'translateY(0px) translateX(0px)' }
			},
			'spotlight-wander': {
				'0%': { transform: 'translate(-50%, -50%) translate(0px, 0px)' },
				'25%': { transform: 'translate(-50%, -50%) translate(100px, -80px)' },
				'50%': { transform: 'translate(-50%, -50%) translate(-60px, 100px)' },
				'75%': { transform: 'translate(-50%, -50%) translate(80px, 60px)' },
				'100%': { transform: 'translate(-50%, -50%) translate(0px, 0px)' }
			},
			'mesh-breathe': {
				'0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
				'50%': { transform: 'scale(1.15)', opacity: '0.25' }
			},
			'hue-dance': {
				'0%': { filter: 'hue-rotate(0deg)' },
				'50%': { filter: 'hue-rotate(30deg)' },
				'100%': { filter: 'hue-rotate(0deg)' }
			},

			// Effect Animations
			'shimmer': {
				'0%, 100%': { filter: 'brightness(1) contrast(1)' },
				'50%': { filter: 'brightness(1.2) contrast(1.1)' }
			},
			'metallic-shimmer': {
				'0%': { backgroundPosition: '-200% 0' },
				'100%': { backgroundPosition: '200% 0' }
			},
			'premium-glow': {
				'0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)' },
				'50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.25)' }
			},
			// Icon micro-animations for Technology page
			'icon-pulse': {
				'0%, 100%': { transform: 'scale(1)' },
				'50%': { transform: 'scale(1.15)' }
			},
			'icon-bounce': {
				'0%, 100%': { transform: 'translateY(0)' },
				'50%': { transform: 'translateY(-4px)' }
			},
			'icon-tilt': {
				'0%, 100%': { transform: 'rotate(0deg)' },
				'50%': { transform: 'rotate(8deg)' }
			},
			'icon-wave': {
				'0%, 100%': { transform: 'translateX(0)' },
				'25%': { transform: 'translateX(-2px)' },
				'75%': { transform: 'translateX(2px)' }
			},
			'scroll-up': {
				'0%': { transform: 'translateY(0)' },
				'100%': { transform: 'translateY(-50%)' }
			},
			'marquee': {
				'0%': { transform: 'translateX(0)' },
				'100%': { transform: 'translateX(-50%)' }
			},
			'flow-dash': {
				'0%': { strokeDashoffset: '12' },
				'100%': { strokeDashoffset: '0' }
			},
			'flow-pulse': {
				'0%': { transform: 'translateX(0px)', opacity: '0' },
				'15%': { opacity: '1' },
				'80%': { opacity: '1' },
				'100%': { transform: 'translateX(40px)', opacity: '0' }
			}
		},

			// Animations
			animation: {
				// Core Animations
				'rollup': 'rollup 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
				'accordion-down': 'accordion-down 0.3s cubic-bezier(0.87, 0, 0.13, 1)',
				'accordion-up': 'accordion-up 0.3s cubic-bezier(0.87, 0, 0.13, 1)',
				'collapsible-down': 'collapsible-down 0.2s ease-out',
				'collapsible-up': 'collapsible-up 0.2s ease-out',
				
				// Entrance Animations
				'unleashed': 'unleashed 1.2s ease-out',
				'fadeUpSoft': 'fadeUpSoft 0.4s ease-out',

				// Brushstroke Animations
				'brushstroke': 'brushstroke 1.5s ease-out',
				'brushstroke-draw': 'brushstroke-draw 1.5s ease-out',

			// Movement Animations
			'float': 'float 6s ease-in-out infinite',
			'bounce': 'bounce 4s ease-in-out infinite',
			'float-slow': 'float-slow 12s ease-in-out infinite',
			'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
			'draw-line': 'draw-line 2s ease-out forwards',
			'fade-float': 'fade-float 1s ease-out forwards',
			'ripple': 'ripple 3s ease-out infinite',
			'particle-drift': 'particle-drift 20s ease-in-out infinite',
			'morph-slow': 'morph-slow 15s ease-in-out infinite',
			'color-shift': 'color-shift 10s ease-in-out infinite',

		// Effect Animations
		'shimmer': 'shimmer 3s ease-in-out infinite',
		'metallic-shimmer': 'metallic-shimmer 2s infinite',
		'premium-glow': 'premium-glow 3s ease-in-out infinite',

		// Gradient Background Animations
		'gradient-rotate': 'gradient-rotate 20s linear infinite',
		'gradient-rotate-reverse': 'gradient-rotate-reverse 25s linear infinite',
		'aurora-wave': 'aurora-wave 8s ease-in-out infinite',
		'spotlight-wander': 'spotlight-wander 25s ease-in-out infinite',
		'mesh-breathe': 'mesh-breathe 10s ease-in-out infinite',
		'hue-dance': 'hue-dance 30s ease-in-out infinite',
		// Icon micro-animations
		'icon-pulse': 'icon-pulse 0.6s ease-in-out',
		'icon-bounce': 'icon-bounce 0.5s ease-in-out',
		'icon-tilt': 'icon-tilt 0.4s ease-in-out',
		'icon-wave': 'icon-wave 0.5s ease-in-out',
		'scroll-up': 'scroll-up 16s linear infinite',
		'marquee': 'marquee 20s linear infinite',
		'flow-dash': 'flow-dash 0.9s linear infinite',
		'flow-pulse': 'flow-pulse 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
		}
	}
},
plugins: [require("tailwindcss-animate")],
} satisfies Config;
