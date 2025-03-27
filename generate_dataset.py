import csv
import json
import time
import argparse
from pathlib import Path
from openai import OpenAI
import logging
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("dataset_generation.log"),
    ]
)

# Initialize OpenAI client
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

REASONING_SYSTEM_PROMPT = """Your role is to generate a detailed Chain of Thought (CoT) reasoning process for a Git-related problem where you already know the correct command or sequence of commands.

I will provide you with a Git-related user request and its correct response (e.g., the appropriate Git command or explanation). Your task is to generate the detailed thinking process that would lead to this response.

Please structure your response using the following format:
<think>
{detailed step-by-step reasoning process that leads to the given Git command or explanation}
</think>

<answer>
{the given response - repeat exactly as provided}
</answer>

Your thinking process should clearly identify the user's intention, break it down into Git concepts, and show why the selected command(s) solve the problem. Mention any assumptions or alternatives when relevant.
"""

import concurrent.futures

def model_call(model, instruction, response, max_retries=5, retry_delay=5, timeout=180):
    """Call the model with retry logic and timeout"""
    question = f"Question:{instruction}\nAnswer: {response}"
    messages = [
        {"role": "system", "content": REASONING_SYSTEM_PROMPT},
        {"role": "user", "content": question},
    ]

    def call_openai():
        return client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.2,
            max_tokens=2048
        )
    
    for attempt in range(max_retries):
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(call_openai)
                completion = future.result(timeout=timeout)
                return completion.choices[0].message.content
        except concurrent.futures.TimeoutError:
            logging.warning(f"Attempt {attempt+1} timed out after {timeout} seconds")
        except Exception as e:
            logging.warning(f"Attempt {attempt+1} failed: {e}")
        
        if attempt < max_retries - 1:
            logging.info(f"Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
            retry_delay *= 1.5
        else:
            logging.error(f"Failed after {max_retries} attempts")
            return None

def parse_reasoning(response):
    """Parse the reasoning from the response"""
    try:
        think_start = response.find("<think>")
        think_end = response.find("</think>")
        answer_start = response.find("<answer>")
        answer_end = response.find("</answer>")
        
        if think_start == -1 or think_end == -1 or answer_start == -1 or answer_end == -1:
            logging.warning("Could not parse reasoning properly, format may be incorrect")
            return {"reasoning": response, "response": ""}
        
        reasoning = response[think_start + 7:think_end].strip()
        answer = response[answer_start + 8:answer_end].strip()
        
        return {"reasoning": reasoning, "response": answer}
    except Exception as e:
        logging.error(f"Error parsing reasoning: {e}")
        return {"reasoning": "", "response": ""}

def generate_dataset(input_csv, output_json, model="deepseek-ai/deepseek-r1", sample_size=None):
    """Generate a dataset from CSV and save to JSON"""
    # Read CSV file
    try:
        with open(input_csv, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            # Skip header row
            header = next(reader)
            # Read all rows
            rows = list(reader)
            
        # Sample if needed
        if sample_size and sample_size < len(rows):
            import random
            rows = random.sample(rows, sample_size)
            
        logging.info(f"Processing {len(rows)} rows from {input_csv}")
        
        # Process each row
        dataset = []
        
        for row in tqdm(rows, desc="Generating CoT Reasoning"):
            if len(row) < 2:
                logging.warning(f"Skipping row with insufficient data: {row}")
                continue
                
            instruction = row[0]
            response = row[1]
            
            # Generate reasoning
            reasoning_result = model_call(model, instruction, response)
            
            if reasoning_result:
                parsed = parse_reasoning(reasoning_result)
                
                entry = {
                    "instruction": instruction,
                    "response": response,
                    "reasoning": parsed["reasoning"]
                }
                
                dataset.append(entry)
            else:
                logging.error(f"Failed to generate reasoning for: {instruction}")
        
        # Write to JSON
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)
        
        logging.info(f"Successfully saved {len(dataset)} entries to {output_json}")
        return True
    
    except Exception as e:
        logging.error(f"Error generating dataset: {e}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a dataset with Chain of Thought reasoning from Git prompts")
    parser.add_argument("--input", default="./dataset/git-prompt/git_prompt.csv", 
                        help="Path to input CSV file")
    parser.add_argument("--output", default="./dataset/git-prompt/git_prompt_with_reasoning.json", 
                        help="Path to output JSON file")
    parser.add_argument("--model", default="deepseek-ai/deepseek-r1", 
                        help="Model to use for generating reasoning")
    parser.add_argument("--sample", type=int, default=None, 
                        help="Number of samples to process (for testing)")
    
    args = parser.parse_args()
    
    # Ensure output directory exists
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    
    # Generate dataset
    generate_dataset(args.input, args.output, args.model, args.sample)
