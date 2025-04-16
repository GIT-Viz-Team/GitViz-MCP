import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)

# Set up environment variables
os.environ["TOKENIZERS_PARALLELISM"] = "false"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model and tokenizer
model_name = "google/gemma-3-1b-it"  # You can also use "google/gemma-3-8b" or other variants
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Load model for full fine-tuning
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

# Prepare dataset
dataset = load_dataset("hesamation/git-prompt")  # Replace with your dataset
train_dataset = dataset["train"]

# Preprocess function
def preprocess_function(examples):
    # Format your data as needed
    # This is an example for instruction-following format
    formatted_texts = []
    for instruction, response in zip(examples["instruction"], examples["response"]):
        formatted_text = f"<start_of_turn>user\n{instruction}<end_of_turn>\n<start_of_turn>model\n{response}<end_of_turn>"
        formatted_texts.append(formatted_text)
    
    # Tokenize
    tokenized_inputs = tokenizer(
        formatted_texts,
        truncation=True,
        max_length=2048,
        padding="max_length",
        return_tensors="pt"
    )
    
    # Set labels equal to input_ids for causal language modeling
    tokenized_inputs["labels"] = tokenized_inputs["input_ids"].clone()
    
    return tokenized_inputs

# Preprocess the dataset
tokenized_dataset = train_dataset.map(
    preprocess_function,
    batched=True,
    remove_columns=train_dataset.column_names
)

# Data collator
data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False
)

# Training arguments
training_args = TrainingArguments(
    output_dir="./gemma3-finetuned",
    overwrite_output_dir=True,
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    save_steps=1000,
    save_total_limit=2,
    logging_steps=100,
    learning_rate=2e-5,
    weight_decay=0.01,
    fp16=True,
    remove_unused_columns=False,
    push_to_hub=False,
)

# Initialize trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=data_collator,
    tokenizer=tokenizer,
)

# Start training
trainer.train()

# Save fine-tuned model
model.save_pretrained("./gemma3-finetuned-final")
tokenizer.save_pretrained("./gemma3-finetuned-final")