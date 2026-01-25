
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
				sans: ['"Rubik"', 'system-ui', '-apple-system', 'sans-serif'],
				display: ['"Rubik"', 'system-ui', 'sans-serif'],
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
				// Accordion Animations
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
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
				'bounce': {
					'0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
					'40%': { transform: 'translateY(-8px)' },
					'60%': { transform: 'translateY(-4px)' }
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
				}
			},

			// Animations
			animation: {
				// Core Animations
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
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

				// Effect Animations
				'shimmer': 'shimmer 3s ease-in-out infinite',
				'metallic-shimmer': 'metallic-shimmer 2s infinite',
				'premium-glow': 'premium-glow 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
