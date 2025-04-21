import os
from dotenv import load_dotenv
import asyncio
from semantic_kernel.agents import ChatCompletionAgent
from semantic_kernel.connectors.ai.open_ai import  OpenAIChatCompletion,OpenAIChatPromptExecutionSettings
from semantic_kernel.functions.kernel_function_decorator import kernel_function
from semantic_kernel.functions import kernel_function,KernelArguments
from typing import Annotated
import pandas as pd

load_dotenv()

# 通用设置（可复用）
settings = OpenAIChatPromptExecutionSettings(
    tool_choice="auto",
    temperature=0.5,
    max_tokens=1024
)


class AnalystAgent(ChatCompletionAgent):
    def __init__(self):
        super().__init__(
            service=OpenAIChatCompletion(
                ai_model_id=os.getenv("OPENAI_CHAT_MODEL4"),
                api_key=os.getenv("OPENAI_API_KEY")
            ),
            name="Analyst_Agent",
            instructions=(
                "You are an invisible backend analyst.. Evaluate user requests using appropriate tools. "\
                "Always begin with: '[Analyst_Agent activated]'. "\
                "If you can use plugins to get the data you need and complete the task."\
                "You are not allowed to use any other plugins or tools which not in the plugins that provided to you. "
                "If the request is not solvable with plugins, reply with: '[Forwarding back to Customer_Service_Agent]'."
                "Otherwise, provide the completed analysis directly as part of your response."
            ),
            plugins=[],  # 插件后期加入
            arguments=KernelArguments(settings)
        )


class DatabaseAgent(ChatCompletionAgent):
    def __init__(self):
        super().__init__(
            service=OpenAIChatCompletion(
                ai_model_id=os.getenv("OPENAI_CHAT_MODEL4"),
                api_key=os.getenv("OPENAI_API_KEY")
            ),
            name="Database_Agent",
            instructions=(
                "You are a backend data retrieval agent. "
                "You do NOT interact with the user directly. "
                "Only the Customer_Service_Agent can talk to the user. "
                "If a request lacks information (e.g., merchant name, date, category), ask the Customer_Service_Agent to gather the missing info. "
                "Be concise, and return data or ask only for clarification needed to complete the task."
            ),
            plugins=[]
        )


class CustomerServiceAgent(ChatCompletionAgent):
    def __init__(self):
        self.analyst_agent = AnalystAgent()
        self.database_agent = DatabaseAgent()

        super().__init__(
            service=OpenAIChatCompletion(
                ai_model_id=os.getenv("OPENAI_CHAT_MODEL3"),
                api_key=os.getenv("OPENAI_API_KEY")
            ),
            name="Customer_Service_Agent",
            instructions=(
                "You are the only agent who talks to the user. "
                "You use internal agents to fulfill requests: \n"
                "- Use **Analyst_Agent** for any task that involves analysis, summaries, trends, total spending calculations, charts, or recommendations. \n"
                "- Use **Database_Agent** only for direct fact-based retrieval, such as 'what restaurants did I go to', 'when did I visit Starbucks', or 'how many times did I shop at Walmart'.\n\n"
                "If a request lacks information (like merchant or date), ask Database_Agent to clarify — then ask the user. "
                "Always integrate responses and present them in your own voice. Do not reveal internal agents."
            ),
            plugins=[self.analyst_agent, self.database_agent]
            arguments=KernelArguments(settings)
        )
    @property
    def _analyst_agent(self):
        return AnalystAgent()

    @property
    def _database_agent(self):
        return DatabaseAgent()

# ✅ 实例化
Customer_Service_Agent = CustomerServiceAgent()
Analyst_Agent = CustomerServiceAgent().analyst_agent
Database_Agent = CustomerServiceAgent().database_agent

__all__ = [
    "Customer_Service_Agent",
    "Analyst_Agent",
    "Database_Agent"
]
# Customer_Service_Agent = ChatCompletionAgent(
#         service=OpenAIChatCompletion(ai_model_id=model_id_agent1, api_key=api_key),
#         name="Customer_Service_Agent",
#         instructions="You are a customer service assistant. Handle general inquiries. "\
#         "If the user asks for specific calculations like food spending, forward the request to Analyst_Agent and wait for a result. "\
#         "Prefix this with '[Forwarding to Analyst_Agent]'. After receiving the result, prefix it with '[Response from Analyst_Agent]' "\
#         "and respond fully. After every response, ask the user if they have another question." ,
#         plugins=[Analyst_Agent, Database_Agent],  # Add the Analyst_Agent as a plugin
#     )
