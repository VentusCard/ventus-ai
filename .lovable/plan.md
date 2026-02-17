

# Rename Ventus AI Columns and Update Values

## Changes

### Column Headers (lines 593-594)
- "Ventus AI Category" --> "Ventus AI Lifestyle Pillar"
- "Ventus AI Pattern" --> "Ventus AI Persona"

### Cell Values
Update the "Ventus AI Lifestyle Pillar" column -- all five rows get the same pillar value since they all map to the same lifestyle category:
- Sporting Goods --> **Sports & Activities**
- Outdoor Gear --> **Sports & Activities**
- Recreation App --> **Sports & Activities**
- Outdoor Apparel --> **Sports & Activities**
- National Park --> **Sports & Activities**

The "Ventus AI Persona" column stays as **Outdoor Enthusiast** for all rows (unchanged).

This makes the story even clearer: Legacy systems scatter these into 5 unrelated buckets, while Ventus AI maps them all to one Lifestyle Pillar ("Sports & Activities") and one Persona ("Outdoor Enthusiast").

## File
- **Modify**: `src/pages/TePilot.tsx` (lines 593-691)

