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
class MockPlugin:
    @kernel_function(name="echo", description="Echo input message")
    def echo(self, message: str) -> str:
        return f"你说了：{message}"


# ============ SUB AGENTS ============
#this is the analyst agent that will use tools as plugin and handle all the issues like cost summary tables, give recommendations on savings, and analyse the data as Customer sercvice agent requested
Analyst_Agent = ChatCompletionAgent(
        service=AzureChatCompletion(),
        kernel=kernel,
        name="Analyst_Agent",
        instructions= "You are an invisible backend analyst.. Evaluate user requests using appropriate tools. "\
            "Always begin with: '[Analyst_Agent activated]'. "\
            "If you can use plugins to get the data you need and complete the task."\
            "You are not allowed to use any other plugins or tools which not in the plugins that provided to you. "
            "If the request is not solvable with plugins, reply with: '[Forwarding back to Customer_Service_Agent]'."
            "Otherwise, provide the completed analysis directly as part of your response.",
        plugins=[LedgerService(),NotificationService()], # 所有function放在这里
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
        "If a request lacks information (e.g., merchant name, date, category), ask the Customer_Service_Agent to gather the missing info. "
        "If the request is not solvable with plugins, reply with: '[Forwarding back to Customer_Service_Agent]'."
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
        "You are the only agent who talks to the user. "
        "You use internal agents to fulfill requests: \n"
        "- Use **Analyst_Agent** for any task that involves analysis, summaries, trends, total spending calculations, charts, or recommendations. \n"
        "- Use **Database_Agent** only for direct fact-based retrieval, such as 'what restaurants did I go to', 'when did I visit Starbucks', or 'how many times did I shop at Walmart'.\n\n"
        "If a request lacks information (like merchant or date), ask Database_Agent to clarify — then ask the user. "
        "Always integrate responses and present them in your own voice. Do not reveal internal agents."
    ),
    #plugins=[],
    plugins=[Analyst_Agent, Database_Agent]
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
