# Deployment Checklist

This document outlines the process for deploying the Jordan Crossing to production (GitHub Pages).

## Pre-Deployment Verification

### Code Quality
- [ ] All modified files follow consistent style and formatting
- [ ] No console errors or warnings in browser developer tools
- [ ] All TODO/FIXME comments removed or documented
- [ ] CSS/JS properly minified/optimized where applicable
- [ ] No hardcoded paths or development URLs

### Functionality Testing
- [ ] All 7 records load and display correctly
- [ ] Mystery mode: all 11 doorways route to correct records
- [ ] Four-movement interactions (Discern, Carry, Return, Navigate) work on all records
- [ ] Carry-question persists in localStorage (test in incognito, clear, reload)
- [ ] Search functionality: all test queries return expected results
- [ ] Tag filtering: all filters work independently and combined
- [ ] Related records links: all connections navigate correctly
- [ ] Navigation links: all prev/next/breadcrumb links work
- [ ] No broken links (internal or external)

### Responsive Design
- [ ] Desktop (1200px+): 3-column grid, full navigation visible
- [ ] Tablet (768px–1199px): 2-column grid, navigation responsive
- [ ] Mobile (320px–767px): 1-column grid, hamburger nav or stacked layout
- [ ] Touch targets: all buttons ≥44px × 44px
- [ ] Text readable without horizontal scroll
- [ ] Images scale appropriately

### Performance Audits

#### Lighthouse Audit
Run `npm run audit` or use Chrome DevTools Lighthouse:

- [ ] **Performance**: ≥80 (target: ≥85)
  - Largest Contentful Paint (LCP) <2.5s
  - Cumulative Layout Shift (CLS) <0.1
  - First Input Delay (FID) <100ms
  
- [ ] **Accessibility**: ≥95 (target: ≥90)
  - All images have alt text
  - Color contrast ≥4.5:1
  - Form labels associated
  - Keyboard navigation works
  
- [ ] **SEO**: ≥95 (target: ≥90)
  - Meta description on all pages
  - Mobile-friendly viewport
  - Robots meta tag removed (noindex removed)
  - Structured data (optional schema.org)
  
- [ ] **Best Practices**: ≥95 (target: ≥90)
  - No deprecated APIs
  - No console errors
  - HTTPS enforced
  - CSP headers appropriate

#### 4G Network Test
Using Chrome DevTools Network Throttling (4G Fast):

- [ ] Initial page load: <2 seconds
- [ ] Search query response: <200ms
- [ ] Tag filter response: <100ms
- [ ] Record navigation: <1 second
- [ ] No excessive re-renders or layout thrashing

#### Accessibility Compliance
- [ ] WCAG 2.1 Level AA
  - Keyboard navigation: Tab/Shift+Tab through all interactive elements
  - Screen reader: Navigate with NVDA/VoiceOver
  - Focus indicators: Visible on all focusable elements
  - Color contrast: No text below 4.5:1
  - Semantic HTML: Proper heading hierarchy (h1, h2, h3)
  - ARIA labels: Descriptive labels where needed

### Browser Compatibility
Test on the following browsers/platforms:

- [ ] **Chrome** (latest): Desktop + Mobile
- [ ] **Firefox** (latest): Desktop + Mobile
- [ ] **Safari** (latest): Desktop + Mobile (iOS)
- [ ] **Edge** (latest): Desktop
- [ ] **Mobile browsers**: Default browsers on iOS/Android

### Content Review
- [ ] No "beta" or "private" language visible to end users
- [ ] All record titles and meditations intact
- [ ] Correct formatting (no mojibake or encoding errors)
- [ ] Links to external resources valid (if any)

---

## Deployment Steps

### 1. Final Code Review
```bash
# Check git status
git status

# Review changes
git diff

# Commit final changes (if any)
git add .
git commit -m "Final deployment prep for v1.0"
```

### 2. Version Bump
- [ ] Update cache-buster version in all files (if CSS/JS changed)
  - Format: `?v=YYYYMMDDVN`
  - Example: `?v=20260831V10`

### 3. Push to GitHub
```bash
# Push to master branch
git push origin master

# GitHub Actions will automatically:
# 1. Build static site
# 2. Run any tests (if configured)
# 3. Deploy to GitHub Pages
# 4. Site live at: https://sethtillotson.github.io/jordan-crossing-beta/
```

### 4. Verify Deployment
- [ ] GitHub Actions workflow completed successfully (check Actions tab)
- [ ] GitHub Pages shows green checkmark with latest commit
- [ ] Site accessible at public URL
- [ ] All pages load correctly
- [ ] Search and filtering work in production
- [ ] No 404 errors or missing assets

### 5. Post-Deployment Monitoring (24 hours)
- [ ] Monitor Google Analytics for traffic (if enabled)
- [ ] Check Lighthouse report in PageSpeed Insights
- [ ] Monitor for console errors via Sentry (if configured)
- [ ] Test on production with multiple browsers
- [ ] Verify Google Search Console indexing
- [ ] Check Cloudflare cache stats (if applicable)

---

## Rollback Plan

If critical issues discovered post-deployment:

### 1. Immediate Rollback
```bash
# Revert to previous commit
git revert HEAD

# Push rollback
git push origin master
```

### 2. Investigation
- [ ] Identify root cause of issue
- [ ] Create test case to reproduce
- [ ] Implement fix on develop branch
- [ ] Test thoroughly before re-deploy

### 3. Re-deployment
- [ ] Make fix to appropriate file
- [ ] Commit with clear message
- [ ] Push to master
- [ ] Verify GitHub Actions completes
- [ ] Test on production

---

## SEO Checklist

After deployment, verify SEO setup:

- [ ] noindex meta tag removed from all pages
- [ ] robots.txt configured (allow indexing)
- [ ] sitemap.xml submitted to Google Search Console
- [ ] og: meta tags present (title, description, image)
- [ ] Twitter card meta tags present (optional)
- [ ] Canonical URLs correct (no duplicates)
- [ ] Page titles unique and descriptive
- [ ] Meta descriptions compelling (150–160 chars)

### Google Search Console Setup
1. Add property: `https://sethtillotson.github.io/jordan-crossing-beta/`
2. Verify ownership (add TXT record to DNS or upload verification file)
3. Submit sitemap: `sitemap.xml`
4. Monitor: Search Analytics, Coverage, Performance

### Bing Webmaster Tools Setup
1. Add site to Bing Webmaster Tools
2. Submit sitemap.xml
3. Monitor indexing status

---

## Monitoring & Maintenance

### Daily (First week)
- [ ] Check for errors in browser console
- [ ] Monitor page load performance
- [ ] Spot-check search functionality

### Weekly (First month)
- [ ] Review Lighthouse scores
- [ ] Check Google Search Console indexing
- [ ] Monitor user feedback/issues

### Monthly
- [ ] Update Changelog
- [ ] Review performance metrics
- [ ] Plan next release

### Quarterly
- [ ] Major version audit
- [ ] Browser compatibility re-test
- [ ] Accessibility audit refresh

---

## DNS & CDN Configuration

### GitHub Pages DNS
- [ ] Repository settings: GitHub Pages enabled
- [ ] Custom domain: Configure (if applicable)
- [ ] HTTPS: Enforce HTTPS (automatic via GitHub)
- [ ] Check A records point to GitHub Pages IP:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153

### Cloudflare (if applicable)
- [ ] DNS: Point to GitHub Pages IP
- [ ] SSL/TLS: Full (strict) or Flexible
- [ ] Caching: Cache level = Standard, cache everything with cache tag
- [ ] Rules: Add cache rule for `?v=` query strings (cache 1 year)
- [ ] Minification: Enable for CSS/JS
- [ ] Purge cache after deployment

---

## Documentation

After deployment:
- [ ] README.md updated for public audience
- [ ] CHANGELOG.md reflects v1.0 release
- [ ] DEPLOYMENT.md (this file) kept up to date
- [ ] Code comments updated where needed

---

## Contacts & Escalation

**Development Lead**: Barak (AI watchman)  
**Content Steward**: Seth Tillotson  
**Emergency Contact**: [Define as needed]

---

**Last Updated**: August 31, 2026  
**Status**: Ready for v1.0 deployment  
**Approved By**: [To be signed off]
