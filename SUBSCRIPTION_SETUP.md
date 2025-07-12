# Subscription System Setup Guide

## Overview
The subscription system has been implemented with three tiers:
- **Free**: 1 trip/month, 1 regeneration/month, 3-day max trips
- **Explorer**: 5 trips/month, unlimited regenerations, 30-day max trips, PDF export
- **Adventurer**: Unlimited trips, unlimited regenerations, unlimited duration, all features

## Database Setup

1. **Run the SQL script** in your Supabase SQL editor:
   - Copy the contents of `scripts/setup-db.sql`
   - Paste it into your Supabase SQL editor
   - Run the script

2. **Verify the tables were created**:
   - `user_subscriptions` - stores user plan information
   - All existing tables now have `user_id` columns
   - Row Level Security (RLS) policies are in place

## Features Implemented

### 1. Plan Enforcement
- **Trip Creation**: Users can only create trips within their plan limits
- **Trip Duration**: Free users limited to 3-day trips, Explorer to 30-day trips
- **Regenerations**: Free users get 1 regeneration, Explorer+ get unlimited
- **Export**: Only Explorer+ plans can export itineraries

### 2. UI Components
- **Subscription Status**: Shows current plan in header
- **Upgrade Modal**: Appears when users hit limits
- **Pricing Page**: Functional upgrade buttons
- **Usage Dashboard**: Shows current usage and limits

### 3. API Endpoints
- `/api/subscription/upgrade` - Handles plan upgrades
- Enhanced trip creation with plan validation
- Enhanced itinerary regeneration with plan validation

## How to Test

### 1. Create a Free Account
- Sign up for a new account
- Should automatically get 'free' plan
- Try creating a trip - should work
- Try creating a second trip - should show upgrade prompt

### 2. Test Plan Limits
- **Free Plan**:
  - Create 1 trip (should work)
  - Try to create a 2nd trip (should show upgrade prompt)
  - Try to create a 4+ day trip (should show duration error)
  - Try to regenerate itinerary twice (should show limit error)
  - Try to export itinerary (should show feature restriction)

### 3. Test Upgrades
- Click upgrade buttons on pricing page
- Should update user's plan in database
- Should allow previously restricted features

## Environment Variables

Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

### user_subscriptions table
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- plan: VARCHAR(20) ('free', 'explorer', 'adventurer')
- status: VARCHAR(20) ('active', 'inactive', 'cancelled')
- current_period_start: TIMESTAMP
- current_period_end: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Updated existing tables
- All tables now have `user_id` column
- RLS policies ensure users can only access their own data
- Automatic free subscription creation for new users

## Troubleshooting

### Common Issues

1. **"Cannot find name 'subscriptionManager'"**
   - Make sure `lib/subscriptionManager.ts` exists
   - Check import statements in components

2. **Database errors**
   - Run the SQL script in Supabase SQL editor
   - Check that RLS policies are enabled
   - Verify user_subscriptions table exists

3. **Upgrade not working**
   - Check that `/api/subscription/upgrade` endpoint exists
   - Verify user authentication is working
   - Check browser console for errors

### Testing Checklist

- [ ] Database tables created successfully
- [ ] New users get free plan automatically
- [ ] Trip creation respects plan limits
- [ ] Trip duration validation works
- [ ] Regeneration limits enforced
- [ ] Export feature restricted to paid plans
- [ ] Upgrade buttons work
- [ ] Subscription status shows in header
- [ ] Usage dashboard displays correctly

## Next Steps

1. **Payment Integration**: Add Stripe or similar for actual payments
2. **Email Notifications**: Send upgrade/downgrade emails
3. **Usage Analytics**: Track feature usage for insights
4. **Team Features**: Implement team collaboration for Adventurer plan
5. **Advanced Analytics**: Add analytics dashboard for Adventurer plan 