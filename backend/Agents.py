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
from backend.functions import LedgerService, RecordService, NotificationService, UserService, ChartPlugin
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
        plugins=[LedgerService(),ChartPlugin(),NotificationService()], # 所有function放在这里
        #plugins=[]
    )

Database_Agent = ChatCompletionAgent(
    service=AzureChatCompletion(),
    kernel=kernel,
    name="Database_Agent",
    instructions=(
        "You are a backend data retrieval agent. "
        "You do NOT interact with the user directly. "
        "Only the Customer_Service_Agent can talk to the user. "
        # "If a request lacks information (e.g., merchant name, date, category), ask the Customer_Service_Agent to gather the missing info. "
        "If the request is not solvable with plugins, reply with: '[Forwarding back to Customer_Service_Agent]'."
        "When an argument is missing, please fill it with the most reasonable value. e.g. if category is missing, and user says 'I bought a jacket', you can fill the category with 'clothing'."
        "If you added any information in the argument that is not provided by the user, please fill the 'is_AI_generated' field with boolean True."
        "When replying with ledgers or records information, please make sure to include the _id field in the response."
        "If the user tries to search by name"
        "Handle anything about record service, such as creating, updating, deleting records. "
        "Be concise, and return data or ask only for clarification needed to complete the task."
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
        "You are a bookkeeping assistant.  "
        "You are the only agent who talks to the user. "
        "When a user querys, you should try to invoke kernel functions. "
        "- Use **Analyst_Agent** for any task that involves analysis, summaries, trends, total spending calculations, charts, or recommendations."
        "- Forward data extraction, transformation and load requests to the Database_Agent, such as 'what restaurants did I go to', 'when did I visit Starbucks', or 'how many times did I shop at Walmart'."
        "If a request lacks information (like merchant or date), ask Database_Agent to clarify — then ask the user. "
        "If the user name is not provided, please use 'user123' as the default name."
        "if the ledger name is not provided, please use 'Monthly budget' as the default ledger name."
        "Always integrate responses and present them in your own voice. Do not reveal internal agents."
    ),
    #plugins=[],
    plugins=[TaskRouter(),Analyst_Agent, Database_Agent]
)


__all__ = [
    "Customer_Service_Agent",
    "Analyst_Agent",
    "Database_Agent"
]

# async def main():

#     response = await Customer_Service_Agent.get_response(messages="Show me all the purchases in ledger with id 97e8f621-a6a1-4882-ad22-d5adfca27ac9")
#     print(str(response.content))
#     #print type(response.content)
#     print(type(str(response.content)))

# asyncio.run(main()) 
