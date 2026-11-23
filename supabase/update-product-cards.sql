-- Fictional demonstration product copy and AI-generated illustrations.
-- Run AFTER deploying the product image files to Vercel.
-- Updates the original demo IDs only. Does not insert products or change
-- names, prices, stock, heat ratings, visibility, categories or order history.
BEGIN;

WITH catalogue(id, expected_name, description, image_url) AS (
  VALUES
  ('a4000000-0000-4000-8000-000000000001'::uuid, 'Sweet Ember', 'Sweet pepper, honey and a gentle jalapeno glow. Sweet Ember brings mellow warmth and a rounded sweetness to everyday meals. Drizzle it over grilled chicken, roasted vegetables or a stacked sandwich, or stir a spoonful into a dipping sauce for an easy sweet-and-spicy finish.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/sweet-ember.jpg'),
  ('a4000000-0000-4000-8000-000000000002'::uuid, 'Jalapeno Verde', 'Fresh jalapeno, bright lime and a lively touch of cilantro. This green sauce balances a crisp, tangy flavour with an approachable chilli kick. Spoon it over tacos, grain bowls and grilled vegetables, or mix it into a dressing when a dish needs a little extra freshness.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/jalapeno-verde.jpg'),
  ('a4000000-0000-4000-8000-000000000003'::uuid, 'Smoky Chipotle', 'Smoky chipotle meets rich tomato and savoury garlic. A deep, rounded sauce with gentle warmth and a lingering smoky finish. Add it to burgers, brush it over grilled dishes or stir it into beans for an easy barbecue-inspired boost.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/smoky-chipotle.jpg'),
  ('a4000000-0000-4000-8000-000000000004'::uuid, 'Cayenne Classic', 'Bright cayenne heat with a clean, tangy vinegar bite. This straightforward red pepper sauce is made for the moments when a meal needs a sharper edge. Splash it over pizza, toss it with wings or serve it alongside crispy potatoes.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/cayenne-classic.jpg'),
  ('a4000000-0000-4000-8000-000000000005'::uuid, 'Garlic Fire', 'Bold garlic and red chilli with a savoury, warming finish. Garlic Fire puts flavour up front, followed by a confident pepper kick. Stir it through pasta, add it to a marinade or spoon it into a dip for a rich, garlicky lift.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/garlic-fire.jpg'),
  ('a4000000-0000-4000-8000-000000000006'::uuid, 'Mango Habanero', 'Juicy mango sweetness followed by a lively habanero kick. A squeeze of lime brings balance to this bright, fruit-forward sauce. Try it with grilled chicken, rice bowls or seafood, or use it as the starting point for a tropical glaze.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/mango-habanero.jpg'),
  ('a4000000-0000-4000-8000-000000000007'::uuid, 'Pineapple Heat', 'Tangy pineapple, warming ginger and a bold habanero finish. This tropical sauce starts bright and fruity before the chilli builds. Pair it with grilled dishes, drizzle it over noodles or stir a little into a sweet-and-sour style dressing.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/pineapple-heat.jpg'),
  ('a4000000-0000-4000-8000-000000000008'::uuid, 'Habanero Inferno', 'Full-bodied habanero heat with the earthy sweetness of carrot and onion. A punchy orange sauce that brings both flavour and fire to the table. Add a small amount to tacos, stews or rice dishes and let its lingering chilli character do the rest.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/habanero-inferno.jpg'),
  ('a4000000-0000-4000-8000-000000000009'::uuid, 'Ghost Pepper', 'Deep red ghost pepper heat with tomato richness and a smoky edge. This intense sauce builds into a long, peppery finish rather than disappearing after the first bite. Use a small amount to bring depth to chilli, marinades or a hearty pot of beans.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/ghost-pepper.jpg'),
  ('a4000000-0000-4000-8000-000000000010'::uuid, 'Scorpion Sting', 'Trinidad Scorpion heat sharpened with garlic and a flash of lime. Scorpion Sting combines a bright opening with an intense, lingering pepper finish. A small addition brings a bold character to sauces, marinades and slow-cooked dishes.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/scorpion-sting.jpg'),
  ('a4000000-0000-4000-8000-000000000011'::uuid, 'Carolina Reaper', 'Fruity Carolina Reaper flavour with a fiercely persistent finish. This is one of the hottest sauces in our demonstration range, built around the pepper''s distinctive character. Add sparingly to a larger dish when you want an unmistakable step up in heat.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/carolina-reaper.jpg'),
  ('a4000000-0000-4000-8000-000000000012'::uuid, 'The Final Inferno', 'Carolina Reaper and Trinidad Scorpion meet in our hottest demonstration blend. Dark pepper flavours and warming spices lead into an exceptionally intense finish. Designed as the final stop in the collection for chilli enthusiasts looking for its boldest flavour profile.', 'https://ecommerce-web-xi-rose.vercel.app/assets/images/products/the-final-inferno.jpg')
)
UPDATE public.products AS p
SET description = c.description, image_url = c.image_url
FROM catalogue AS c
WHERE p.id = c.id AND p.name = c.expected_name
RETURNING p.id, p.name, p.image_url;

COMMIT;
