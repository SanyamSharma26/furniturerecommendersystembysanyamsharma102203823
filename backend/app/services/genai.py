import os
try:
    from langchain import LLMChain, PromptTemplate
    from langchain.llms import OpenAI
except Exception:
    LLMChain = None
    PromptTemplate = None
    OpenAI = None

PROMPT = """Write a short creative product design description for the following product. Keep it 30-80 words.

Title: {title}
Brand: {brand}
Material: {material}
Color: {color}

Description:"""

async def generate_description(metadata: dict):
    try:
        if os.getenv('OPENAI_API_KEY') and LLMChain and OpenAI and PromptTemplate:
            prompt = PromptTemplate(input_variables=['title','brand','material','color'], template=PROMPT)
            llm = OpenAI(temperature=0.7)
            chain = LLMChain(llm=llm, prompt=prompt)
            out = chain.run({
                'title': metadata.get('title',''),
                'brand': metadata.get('brand',''),
                'material': metadata.get('material',''),
                'color': metadata.get('color','')
            })
            return out.strip()
    except Exception:
        pass
    return f"A {metadata.get('color','').strip()} {metadata.get('material','').strip()} {metadata.get('title','').strip()} — clean lines and thoughtful details for modern homes."
