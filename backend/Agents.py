import os
from dotenv import load_dotenv
import asyncio
from semantic_kernel.agents import ChatCompletionAgent
from semantic_kernel.connectors.ai.open_ai import  OpenAIChatCompletion,OpenAIChatPromptExecutionSettings
from semantic_kernel.functions.kernel_function_decorator import kernel_function
from semantic_kernel.functions import kernel_function,KernelArguments
from semantic_kernel.kernel import Kernel
#from functions import LedgerService, RecordService, NotificationService, DatabaseClient
from typing import Annotated
import pandas as pdS


# 通用设置（可复用）
settings = OpenAIChatPromptExecutionSettings(
    tool_choice="auto",
    temperature=0.5,
    max_tokens=1024
)

# 读取环境变量
load_dotenv()  # Load the .env file
model_id_agent1 = os.getenv("OPENAI_CHAT_MODEL3")
model_id_agent2 = os.getenv("OPENAI_CHAT_MODEL4")
api_key = os.getenv("OPENAI_API_KEY")

print("model_id_agent1:", model_id_agent1)
thread = None

#this is the analyst agent that will use tools as plugin and handle all the issues like cost summary tables, give recommendations on savings, and analyse the data as Customer sercvice agent requested
Analyst_Agent = ChatCompletionAgent(
        service=OpenAIChatCompletion(ai_model_id=model_id_agent2, api_key=api_key),
        name="Analyst_Agent",
        instructions= "You are an invisible backend analyst.. Evaluate user requests using appropriate tools. "\
            "Always begin with: '[Analyst_Agent activated]'. "\
            "If you can use plugins to get the data you need and complete the task."\
            "You are not allowed to use any other plugins or tools which not in the plugins that provided to you. "
            "If the request is not solvable with plugins, reply with: '[Forwarding back to Customer_Service_Agent]'."
            "Otherwise, provide the completed analysis directly as part of your response.",
        plugins=[LedgerService(),NotificationService()], # 所有function放在这里
        arguments=KernelArguments(settings)
    )

Database_Agent = ChatCompletionAgent(
    service=OpenAIChatCompletion(ai_model_id=model_id_agent2, api_key=api_key),
    name="Database_Agent",
    instructions=(
        "You are a backend data retrieval agent. "
        "You do NOT interact with the user directly. "
        "Only the Customer_Service_Agent can talk to the user. "
        "If a request lacks information (e.g., merchant name, date, category), ask the Customer_Service_Agent to gather the missing info. "
        "Be concise, and return data or ask only for clarification needed to complete the task."
    ),
    plugins=[RecordService(),NotificationService()], # 所有function放在这里
)

# This is the main agent that commnunicate with user
Customer_Service_Agent = ChatCompletionAgent(
    service=OpenAIChatCompletion(ai_model_id=model_id_agent1, api_key=api_key),
    name="Customer_Service_Agent",
    instructions=(
        "You are the only agent who talks to the user. "
        "You use internal agents to fulfill requests: \n"
        "- Use **Analyst_Agent** for any task that involves analysis, summaries, trends, total spending calculations, charts, or recommendations. \n"
        "- Use **Database_Agent** only for direct fact-based retrieval, such as 'what restaurants did I go to', 'when did I visit Starbucks', or 'how many times did I shop at Walmart'.\n\n"
        "If a request lacks information (like merchant or date), ask Database_Agent to clarify — then ask the user. "
        "Always integrate responses and present them in your own voice. Do not reveal internal agents."
    ),
    plugins=[Analyst_Agent, Database_Agent]
)


__all__ = [
    "Customer_Service_Agent",
    "Analyst_Agent",
    "Database_Agent"
]

async def main():

    response = await Customer_Service_Agent.get_response(messages="Hello")
    print(response.content)

asyncio.run(main()) 
