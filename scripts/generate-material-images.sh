#!/bin/bash
# Generira reference slike za vseh 14 materialov v katalogu VizualizatorPRO
set -e
MATERIALS_DIR="/home/z/my-project/public/materials"
mkdir -p "$MATERIALS_DIR"

echo "🎨 Generiram referenčne slike za 14 materialov..."

# WPC profili (6)
z-ai image -p "Professional product photo of modern WPC composite horizontal slats balcony railing, warm teak wood color, clean horizontal lines, premium composite material, architectural photography, daylight, sharp focus, high quality" -o "$MATERIALS_DIR/wpc-h-line.jpg" -s 1024x1024
z-ai image -p "Professional product photo of modern WPC composite vertical balusters balcony railing, vertical slats, premium wood composite material, warm natural teak tones, contemporary design, architectural photography" -o "$MATERIALS_DIR/wpc-v-line.jpg" -s 1024x1024
z-ai image -p "Professional product photo of modern full panel WPC composite balcony railing, solid panels no gaps, premium wood composite material, warm wood color, contemporary privacy screen design, architectural photography" -o "$MATERIALS_DIR/wpc-panel.jpg" -s 1024x1024
z-ai image -p "Professional product photo of premium brushed stainless steel inox railing balcony, modern minimalist horizontal lines, sleek metal finish, contemporary luxury design, architectural photography, sharp focus" -o "$MATERIALS_DIR/inox-line.jpg" -s 1024x1024
z-ai image -p "Professional product photo of frameless laminated glass balcony railing, transparent safety glass panels, modern minimalist design, stainless steel clamps, panoramic view, premium architecture, daylight" -o "$MATERIALS_DIR/steklo-full.jpg" -s 1024x1024
z-ai image -p "Professional product photo of classic aluminum balcony railing, powder coated metal, vertical balusters, traditional European balcony design, anthracite grey color, painted metal, architectural photography" -o "$MATERIALS_DIR/alu-klasik.jpg" -s 1024x1024

# Keramike (8)
z-ai image -p "Professional product photo of ceramic porcelain tiles with wood plank pattern, realistic wood texture, warm oak color, modern large format tiles, contemporary flooring sample, studio lighting" -o "$MATERIALS_DIR/keramika-wood.jpg" -s 1024x1024
z-ai image -p "Professional product photo of ceramic porcelain tiles with natural stone texture, slate stone pattern, grey tones, anti-slip matte finish, contemporary flooring sample, studio lighting" -o "$MATERIALS_DIR/keramika-stone.jpg" -s 1024x1024
z-ai image -p "Professional product photo of polished porcelain marble effect tiles, Carrara marble pattern, white with grey veins, luxurious glossy finish, large format slabs, elegant sample, studio lighting" -o "$MATERIALS_DIR/keramika-marble.jpg" -s 1024x1024
z-ai image -p "Professional product photo of mediterranean mosaic tiles, small colorful ceramic pieces, blue and white pattern, moroccan style, decorative accent wall sample, traditional craftsmanship" -o "$MATERIALS_DIR/keramika-mozaik.jpg" -s 1024x1024
z-ai image -p "Professional product photo of subway metro tiles, classic brick pattern, glossy white ceramic tiles, beveled edges, contemporary kitchen backsplash sample, timeless design" -o "$MATERIALS_DIR/keramika-metro.jpg" -s 1024x1024
z-ai image -p "Professional product photo of terracotta tiles, warm orange clay color, handcrafted rustic finish, traditional mediterranean flooring, natural variation in color, vintage charm" -o "$MATERIALS_DIR/keramika-terracotta.jpg" -s 1024x1024
z-ai image -p "Professional product photo of encaustic cement tiles, geometric pattern, black and white diamond design, contemporary boho style, handcrafted vintage look, decorative floor sample" -o "$MATERIALS_DIR/keramika-cement.jpg" -s 1024x1024
z-ai image -p "Professional product photo of large format slim porcelain tiles, seamless surface, minimalist modern design, neutral beige color, contemporary luxury interior, no visible grout lines" -o "$MATERIALS_DIR/keramika-large.jpg" -s 1024x1024

echo "🎉 Vseh 14 materialov generiranih!"
ls -la "$MATERIALS_DIR"
