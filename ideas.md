# Personal Showroom - Design Concept

## Design Philosophy: Minimalist Sophistication with Awwwards Inspiration

### Chosen Approach: **"Refined Minimalism with Strategic Micro-Details"**

This design philosophy prioritizes **less is more** with intentional moments of visual interest. Inspired by Awwwards award-winning sites, the approach combines:

- **Extreme whitespace** as a design element, not absence
- **Typography as primary visual hierarchy** (Sarabun for all Thai text)
- **Subtle motion and micro-interactions** that feel purposeful
- **Strategic use of color** - minimal palette with accent moments
- **Geometric precision** - clean lines, structured grids, no unnecessary decoration

---

## Design System

### Color Philosophy
- **Primary Background:** Off-white/Cream (`#f8f7f4`) - breathing room
- **Text Primary:** Deep charcoal (`#1a1d2e`) - professional, readable
- **Accent Moments:** Muted gold (`#d4af7a`) - for CTAs and highlights only
- **Dividers:** Subtle gray (`#e8e6e2`) - barely visible structure
- **Hover States:** Soft transitions to accent color

**Reasoning:** The palette is intentionally restrained. The eye is drawn to typography and structure, not color chaos.

### Typography System (All Thai: Sarabun)
- **Display/Hero:** Sarabun Bold (700) - commanding presence
- **Section Headers:** Sarabun SemiBold (600) - clear hierarchy
- **Body Text:** Sarabun Regular (400) - readable, professional
- **Micro-copy (buttons, labels):** Sarabun Medium (500) - subtle emphasis

**Line Height:** 1.6 for body, 1.2 for headings (breathing room)
**Letter Spacing:** Minimal, natural (no artificial widening)

### Layout Paradigm
- **Hero:** Full-width, centered, generous vertical spacing
- **Sections:** Max-width 1200px, centered, with asymmetric internal grids
- **Cards/Work Items:** Minimal borders, maximum whitespace between elements
- **Dividers:** Horizontal lines (`━━━━`) as visual breaks (from original content)

### Signature Visual Elements
1. **Horizontal Dividers** - Subtle lines that echo the original markdown structure
2. **Generous Gutters** - 3-4x normal spacing between major sections
3. **Micro-animations** - Fade-in on scroll, subtle hover lifts on interactive elements

### Interaction Philosophy
- **Hover Effects:** Gentle color shift to accent (gold), no scale/transform
- **Click Feedback:** Smooth transition, no jarring changes
- **Scroll Behavior:** Fade-in animations for sections as they enter viewport
- **Loading States:** Minimal spinners, clear feedback

### Animation Guidelines
- **Entrance:** Fade-in + 50px slide-up over 600ms (easing: ease-out)
- **Hover:** Color transition 200ms, no scale
- **Transitions:** All 300ms cubic-bezier(0.4, 0, 0.2, 1)
- **Avoid:** Bounces, rotations, excessive motion (keep it refined)

### Visual Hierarchy
1. **Hero Name/Title** - Largest, boldest
2. **Section Headers** - Medium-large, clear distinction
3. **Body Copy** - Regular weight, ample line height
4. **Micro-copy (buttons, labels)** - Smaller, slightly lighter

---

## Implementation Notes

### What This Means in Code
- **No gradients** - solid colors only
- **No rounded corners** - sharp edges or very subtle (2-4px max)
- **Minimal shadows** - only for depth on cards (0 2px 8px rgba(0,0,0,0.08))
- **Whitespace-first layout** - use CSS Grid/Flexbox with generous gaps
- **Typography-driven design** - font weight and size do the heavy lifting

### Awwwards Inspiration
- Clean, uncluttered layouts
- Typography as primary design element
- Intentional use of whitespace
- Subtle animations that enhance, not distract
- Professional photography (or generated assets) only
- Clear visual hierarchy through size and weight, not color

---

## The Armory Section
Seamlessly integrated into the portfolio flow, using the same design language:
- Same typography (Sarabun)
- Same whitespace principles
- Same color palette
- Positioned after Resources, before Contact
- Cards with minimal styling, maximum clarity

---

## Design Constraints
- ✅ Sarabun font for ALL Thai text (no exceptions)
- ✅ Minimalist aesthetic (less visual noise)
- ✅ Professional, international vibe
- ✅ Mobile-responsive (single column on mobile, maintains spacing)
- ✅ No prices shown (user will add later)
- ✅ Inspired by Awwwards (clean, sophisticated, intentional)
