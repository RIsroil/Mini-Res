# QR Menu Platform - Frontend Design System

## 🎨 Design Philosophy

This application follows modern Figma-inspired design principles with:
- **Clean & Minimal**: Focused on content with generous white space
- **Smooth Animations**: Framer Motion for delightful interactions
- **Glass Morphism**: Subtle blur effects and transparency
- **Gradient Accents**: Strategic use of color gradients
- **Shadow Depth**: Multi-layered shadows for depth perception
- **Responsive**: Mobile-first approach

## 🎨 Color Palette

### Primary Colors (Red/Rose)
```css
primary-50:  #fef2f2  /* Lightest background */
primary-100: #fee2e2
primary-200: #fecaca
primary-300: #fca5a5
primary-400: #f87171
primary-500: #ef4444  /* Brand color */
primary-600: #dc2626  /* Primary buttons */
primary-700: #b91c1c
primary-800: #991b1b
primary-900: #7f1d1d  /* Darkest */
```

### Secondary Colors (Slate/Gray)
```css
secondary-50:  #f8fafc  /* Background */
secondary-100: #f1f5f9  /* Hover states */
secondary-200: #e2e8f0  /* Borders */
secondary-300: #cbd5e1
secondary-400: #94a3b8  /* Placeholders */
secondary-500: #64748b
secondary-600: #475569  /* Body text */
secondary-700: #334155  /* Headings */
secondary-800: #1e293b
secondary-900: #0f172a  /* Darkest text */
```

## 📐 Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: system-ui, sans-serif

### Font Sizes
```css
text-xs:   0.75rem  (12px)
text-sm:   0.875rem (14px)
text-base: 1rem     (16px)
text-lg:   1.125rem (18px)
text-xl:   1.25rem  (20px)
text-2xl:  1.5rem   (24px)
text-3xl:  1.875rem (30px)
text-4xl:  2.25rem  (36px)
text-5xl:  3rem     (48px)
text-6xl:  3.75rem  (60px)
```

### Font Weights
```css
font-light:     300
font-normal:    400
font-medium:    500
font-semibold:  600
font-bold:      700
font-extrabold: 800
```

## 🔘 Components

### Buttons

#### Primary Button
```tsx
<Button variant="primary">
  Click Me
</Button>
```
- Gradient background: `from-primary-600 to-primary-700`
- White text
- Shadow with primary color
- Hover: Lifts with scale and enhanced shadow
- Active: Scales down slightly

#### Secondary Button
```tsx
<Button variant="secondary">
  Click Me
</Button>
```
- White background
- Gray text
- 2px border
- Hover: Light gray background

#### Outline Button
```tsx
<Button variant="outline">
  Click Me
</Button>
```
- Transparent background
- 2px primary border
- Primary text color
- Hover: Light primary background

### Input Fields

```tsx
<Input
  label="Phone Number"
  icon={<Phone />}
  placeholder="+998901234567"
  error="Invalid phone"
/>
```

**Features:**
- Label above input
- Icon support (left side)
- Rounded corners (12px)
- 2px border that highlights on focus
- Error state with red border and message
- Smooth transitions

### Cards

```tsx
<div className="card">
  Content here
</div>
```

**Properties:**
- White background
- Rounded corners (16px)
- Soft shadow
- Border: 1px gray
- Hover: Enhanced shadow

## 🎭 Animations

### Page Transitions
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Button Interactions
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  Click
</motion.button>
```

### Staggered Children
```tsx
{items.map((item, i) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.1 }}
  >
    {item}
  </motion.div>
))}
```

## 📱 Page Layouts

### Auth Pages
- Centered card layout
- Max width: 448px (28rem)
- Decorative gradient blobs in background
- Logo/icon at top
- Title + subtitle
- Form in card
- Footer text

### Dashboard Layout
- Top navigation bar (sticky)
- Logo left, actions right
- Max width: 1280px container
- Card-based content
- Grid for stats cards
- Responsive breakpoints

## 🌈 Gradient Usage

### Text Gradient
```css
.gradient-text {
  background: linear-gradient(to right, #dc2626, #991b1b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Background Gradients
```css
/* Page background */
bg-gradient-to-br from-secondary-50 via-white to-primary-50

/* Button background */
bg-gradient-to-r from-primary-600 to-primary-700

/* Icon containers */
bg-gradient-to-br from-blue-500 to-blue-600
```

## 🔔 Toast Notifications

```tsx
toast.success('Operation successful!')
toast.error('Something went wrong')
```

**Style:**
- Top-right position
- White background
- Rounded corners (12px)
- Border: 1px gray
- Custom icons for success/error
- 3 second duration
- Smooth slide-in animation

## 📦 Shadows

```css
/* Soft shadow (cards) */
shadow-soft: 0 2px 15px -3px rgba(0, 0, 0, 0.07),
             0 10px 20px -2px rgba(0, 0, 0, 0.04)

/* Hover shadow */
shadow-hover: 0 10px 40px -10px rgba(0, 0, 0, 0.15)

/* Large shadow (buttons) */
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

## 🎯 Spacing Scale

```css
0:    0px
1:    0.25rem  (4px)
2:    0.5rem   (8px)
3:    0.75rem  (12px)
4:    1rem     (16px)
5:    1.25rem  (20px)
6:    1.5rem   (24px)
8:    2rem     (32px)
10:   2.5rem   (40px)
12:   3rem     (48px)
16:   4rem     (64px)
20:   5rem     (80px)
```

## 🌐 Responsive Breakpoints

```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

## ✨ Special Effects

### Blur Background
```tsx
<div className="bg-white/80 backdrop-blur-lg">
  Content with glass morphism
</div>
```

### Gradient Blob Decorations
```tsx
<div className="absolute -top-40 -right-40 w-80 h-80 
                bg-primary-200 rounded-full opacity-20 blur-3xl" />
```

### Smooth Transitions
```css
transition-all duration-200
transition-colors duration-200
```

## 🎨 Component Examples

### Stat Card
```tsx
<div className="card p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-secondary-600">Label</p>
      <p className="text-3xl font-bold text-secondary-900">Value</p>
    </div>
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 
                    flex items-center justify-center shadow-lg">
      <Icon className="w-7 h-7 text-white" />
    </div>
  </div>
</div>
```

### Action Card
```tsx
<button className="p-4 rounded-xl border-2 border-secondary-200 
                   hover:border-primary-500 hover:bg-primary-50 
                   transition-all duration-200 text-left">
  <Icon className="w-8 h-8 text-primary-600 mb-2" />
  <h4 className="font-semibold text-secondary-900">Title</h4>
  <p className="text-sm text-secondary-600">Description</p>
</button>
```

## 🎬 Animation Presets

### Fade In
```tsx
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}
```

### Scale In
```tsx
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', delay: 0.2 }}
```

### Slide In
```tsx
initial={{ x: -20, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ duration: 0.3 }}
```

---

## 🚀 Implementation Notes

1. **Always use design tokens** - Never hardcode colors or sizes
2. **Consistent spacing** - Use the spacing scale consistently
3. **Smooth animations** - Keep transitions under 300ms for responsiveness
4. **Accessibility** - Maintain color contrast ratios (WCAG AA)
5. **Mobile-first** - Design for mobile, enhance for desktop
6. **Performance** - Optimize images, lazy load when possible

---

**Design inspired by:** Figma, Linear, Vercel, and modern SaaS applications
