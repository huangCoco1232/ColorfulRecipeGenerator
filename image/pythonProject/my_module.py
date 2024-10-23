import pandas as pd
import csv
import os
import re
import requests
import io
from PIL import Image

# Get the current script path
path = os.path.dirname(os.path.abspath(__file__))

# 读取 CSV 文件并预处理数据
df = pd.read_csv(path + r'\recipes1.csv', index_col=None)
name_df = df[['name']]
name_df.loc[:, 'name'] = name_df['name'].str.replace(r'\d+', '', regex=True)

# Reading CSV files and preprocessing data
characteristics = [
    "soft, fluffy texture and decorated with intricate icing",
    "crispy exterior and a gooey center, garnished with chocolate drizzle",
    "layers of cream filling and a glossy icing finish",
    "swirls of different colors and topped with edible glitter",
    "rich and creamy with a hint of vanilla and a smooth frosting",
    "moist and dense with a caramel drizzle",
    "light and airy with fruity layers",
    "buttery and sweet with a sprinkle of powdered sugar",
    "crispy with colorful sprinkles and a sweet glaze",
    "decadent with layers of chocolate ganache"
]
backgrounds = [
    "a whimsical forest with vibrant colors",
    "a rustic wooden table with natural light",
    "a dreamy sky backdrop with clouds",
    "a cosmic scene filled with stars",
    "a tranquil garden with blooming flowers",
    "a warm kitchen setting with sunlight streaming in",
    "a serene beach with gentle waves",
    "a magical landscape with sparkling lights",
    "a festive celebration with balloons and confetti",
    "a cozy café atmosphere"
]
styles = ['fantasy', 'realistic', 'whimsical', 'abstract', 'vintage', 'modern', 'dreamy', 'playful', 'elegant', 'charming']

# Generate prompts
prompts = []
for index, row in name_df.iterrows():
    match = re.search(r"of (.+?) (.+)", row['name'])
    if match:
        food_type = match.group(2)
        color = match.group(1)
        prompt = (
            f"Generate a high-quality and Realistic style masterpiece of a {food_type} called \"{row['name']}\""
        )
        prompts.append(prompt)

# prompt
for prompt in prompts:
    print(prompt)

# Save the generated prompts to a CSV file
df_prompt = pd.DataFrame(prompts, columns=['prompt'])
df_prompt.to_csv(path + r'\prompt.csv', index=False, encoding='utf-8')

# Set the image generation API related information
output_folder = os.path.join(path, "generated_images")
os.makedirs(output_folder, exist_ok=True)
API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
headers = {"Authorization": "Bearer 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"}  # 替换为你的实际令牌

# Define the function to request image generation
def query(payload):
    response = requests.post(API_URL, headers=headers, json={"inputs": payload})
    return response.content

# Read prompts and generate images
for index, prompt in df_prompt['prompt'].items():
    image_bytes = query(prompt)
    image = Image.open(io.BytesIO(image_bytes))
    filename = f"{index + 1}.png"
    image_path = os.path.join(output_folder, filename)
    image.save(image_path)
    print(f"Image saved to {image_path}")

print("Finished generating all images.")
