-- The Scoville Inferno: demonstration catalog for public.products.
-- Run schema.sql first, then this file in the Supabase SQL Editor.
-- Product names, prices and heat levels below are fictional demo data.
-- image_url is NULL until real product images are added.
-- Fixed IDs allow repeat runs without duplicate products.
-- Repeat runs refresh these demo products, including their stock.
-- Existing image URLs are preserved. Other products are not changed.

BEGIN;

INSERT INTO public.products
    (id, name, description, price, image_url, scoville, stock)
VALUES
    ('a4000000-0000-4000-8000-000000000001',
     'Sweet Ember',
     'Мягкий соус со сладким перцем, мёдом и лёгкой остротой халапеньо. Подходит к курице, овощам и сэндвичам.',
     6.90, NULL, 1500, 60),
    ('a4000000-0000-4000-8000-000000000002',
     'Jalapeno Verde',
     'Зелёный соус с халапеньо, лаймом и кинзой. Добавляет свежесть и умеренную остроту тако и овощным блюдам.',
     7.50, NULL, 5000, 48),
    ('a4000000-0000-4000-8000-000000000003',
     'Smoky Chipotle',
     'Копчёный чипотле с томатами и чесноком. Насыщенный соус для бургеров, рёбрышек и блюд на гриле.',
     8.90, NULL, 8000, 42),
    ('a4000000-0000-4000-8000-000000000004',
     'Cayenne Classic',
     'Классический перечный соус с кайенским перцем и уксусом. Подходит к пицце, крылышкам и картофелю.',
     7.90, NULL, 15000, 55),
    ('a4000000-0000-4000-8000-000000000005',
     'Garlic Fire',
     'Яркий чесночный соус с красным перцем чили. Для пасты, мяса и домашних маринадов.',
     8.50, NULL, 25000, 36),
    ('a4000000-0000-4000-8000-000000000006',
     'Mango Habanero',
     'Сладкое манго и острый хабанеро с ноткой лайма. Фруктовый соус к курице, рису и морепродуктам.',
     9.90, NULL, 50000, 30),
    ('a4000000-0000-4000-8000-000000000007',
     'Pineapple Heat',
     'Ананас, имбирь и хабанеро в тропическом остром соусе. Подходит к блюдам на гриле и лапше.',
     10.50, NULL, 75000, 24),
    ('a4000000-0000-4000-8000-000000000008',
     'Habanero Inferno',
     'Насыщенный соус с хабанеро, морковью и луком. Выраженная острота и лёгкая естественная сладость.',
     10.90, NULL, 100000, 28),
    ('a4000000-0000-4000-8000-000000000009',
     'Ghost Pepper',
     'Очень острый соус с перцем бхут джолокия и томатами. Дымный аромат и долгое перечное послевкусие.',
     12.90, NULL, 300000, 18),
    ('a4000000-0000-4000-8000-000000000010',
     'Scorpion Sting',
     'Соус с перцем Trinidad Scorpion, чесноком и лаймом. Интенсивная острота с цитрусовыми нотами.',
     14.90, NULL, 600000, 12),
    ('a4000000-0000-4000-8000-000000000011',
     'Carolina Reaper',
     'Экстремально острый соус с перцем Carolina Reaper. Фруктовый аромат и мощное перечное послевкусие.',
     16.90, NULL, 1000000, 8),
    ('a4000000-0000-4000-8000-000000000012',
     'The Final Inferno',
     'Самый острый соус нашей демонстрационной коллекции: смесь Carolina Reaper, Trinidad Scorpion и специй.',
     19.90, NULL, 1500000, 0);
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    scoville = EXCLUDED.scoville,
    stock = EXCLUDED.stock;

COMMIT;
