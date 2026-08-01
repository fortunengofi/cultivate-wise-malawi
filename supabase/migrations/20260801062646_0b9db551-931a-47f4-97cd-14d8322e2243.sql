GRANT SELECT ON public.market_prices TO anon;
CREATE POLICY "Market prices publicly readable" ON public.market_prices FOR SELECT TO anon USING (true);