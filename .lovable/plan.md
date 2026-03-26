

## Replace Sparkles icon with "V" in VentusAIWelcomeView header

### Change
In `src/components/tepilot/insights/VentusAIWelcomeView.tsx` line 153, replace:
```tsx
<Sparkles className="w-5 h-5 text-blue-400" />
```
with:
```tsx
<span className="text-lg font-black text-blue-400 leading-none">V</span>
```

This matches the sidebar's "V" branding and replaces the sparkles icon in the welcome view header.

