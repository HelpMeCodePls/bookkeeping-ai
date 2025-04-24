import os
from dotenv import load_dotenv
import asyncio
from semantic_kernel.agents import ChatCompletionAgent
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion,OpenAIChatPromptExecutionSettings,AzureChatCompletion
from semantic_kernel.functions.kernel_function_decorator import kernel_function
from semantic_kernel.functions import kernel_function,KernelArguments
from semantic_kernel.kernel import Kernel
from semantic_kernel.filters import FunctionInvocationContext
from semantic_kernel.agents import ChatHistoryAgentThread
from backend.functions import LedgerService, RecordService, NotificationService, DatabaseClient
from typing import Annotated

# ============ ENV SETUP ============
load_dotenv()
model_id_agent1 = os.getenv("OPENAI_CHAT_MODEL3")
model_id_agent2 = os.getenv("OPENAI_CHAT_MODEL4")
api_key = os.getenv("OPENAI_API_KEY")

# ============ KERNEL SETUP ============
kernel = Kernel()
# (可选) 添加 debug filter：显示插件调用过程

async def function_invocation_filter(context: FunctionInvocationContext, next):
    """A filter that will be called for each function call in the response."""
    if "messages" not in context.arguments:
        await next(context)
        return
    print(f"    Agent [{context.function.name}] called with messages: {context.arguments['messages']}")
    await next(context)
    print(f"    Response from agent [{context.function.name}]: {context.result.value}")


# The filter is used for demonstration purposes to show the function invocation.
kernel.add_filter("function_invocation", function_invocation_filter)

# 通用设置（可复用）
settings = OpenAIChatPromptExecutionSettings(
    #tool_choice="auto",
    temperature=0.5,
    max_tokens=2000
)

# ============ MOCK PLUGIN ============
class TaskRouter:
    @kernel_function(name="classify_task", description="Classify user request into general, record, or ledger task")
    def classify(self, message: str) -> str:
        if "analysis" in message or "calculate" in message or "sum" in message:
            return "ledger"
        elif "record" in message or "delete" in message or "add" in message:
            return "record"
        else:
            return "general"


# ============ SUB AGENTS ============
#this is the analyst agent that will use tools as plugin and handle all the issues like cost summary tables, give recommendations on savings, and analyse the data as Customer sercvice agent requested
Analyst_Agent = ChatCompletionAgent(
        service=AzureChatCompletion(),
        kernel=kernel,
        name="Analyst_Agent",
        instructions= ("You are the Analyst Agent responsible for processing analytical tasks.\n"
        "You DO NOT interact directly with the user.\n"
        "Your tasks include calculating budgets, generating summaries, identifying trends,\n"
        "and providing insights or recommendations based on the user's financial records.\n"
        "Use only the tools (plugins) provided to you.\n"
        "Always begin your output with '[Analyst_Agent activated]'.\n"
        "If the task cannot be completed, return '[Forwarding back to Customer_Service_Agent]'."
        ),
        plugins=[LedgerService(),NotificationService()], # 所有function放在这里
        #plugins=[]
    )

Database_Agent = ChatCompletionAgent(
    service=AzureChatCompletion(),
    kernel=kernel,
    name="Database_Agent",
    instructions=(
        "You are the Database Agent responsible for handling record-related tasks.\n"
        "You DO NOT interact directly with the user.\n"
        "Your tasks include creating, updating, and retrieving user financial records.\n"
        "Always begin your output with '[Database_Agent activated]'.\n"
        "If any required detail is missing (e.g., merchant name, amount, category),\n"
        "ask the Customer_Service_Agent to clarify with the user.\n"
        "Use only the tools (plugins) provided to you.\n"
        "If the task cannot be completed, return '[Forwarding back to Customer_Service_Agent]'."
    ),
    #plugins=[]
    plugins=[RecordService(),NotificationService()], # 所有function放在这里
)

# ============ MAIN AGENT ============
# This is the main agent that commnunicate with user
Customer_Service_Agent = ChatCompletionAgent(
    service=AzureChatCompletion(),
    kernel=kernel,
    name="Customer_Service_Agent",
    instructions=(
        "You are the only agent that communicates with the user directly.\n"
        "You must understand the user's request and route it appropriately:\n\n"
        "- Use **TaskRouter** plugin to determine if the request is 'general', 'record', or 'ledger'.\n"
        "- Use **Analyst_Agent** for any ledger requests, analysis, budgeting, trends, or spending summaries.\n"
        "- Use **Database_Agent** for any record requests, data entry, modification, or record retrieval.\n\n"
        "If the request is a casual greeting, a general request, or cannot be routed, respond politely yourself.\n"
        "NEVER reveal internal agent names or plugin behavior to the user.\n"
        "Always respond in your own words using the results from sub-agents."
    ),
    #plugins=[],
    plugins=[TaskRouter(),Analyst_Agent, Database_Agent]
)


__all__ = [
    "Customer_Service_Agent",
    "Analyst_Agent",
    "Database_Agent"
]

async def main():

    response = await Customer_Service_Agent.get_response(messages="Can you help me to analyze how much I spent in total last month?")
    print(str(response.content))
    #print type(response.content)
    print(type(str(response.content)))

asyncio.run(main()) 
