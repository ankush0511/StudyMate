from langgraph.graph import StateGraph,START,END
from structure import AgentState
from node import decomposer_node,scheduler_node,route_to_planner


workflow = StateGraph(AgentState)
workflow.add_node("decomposer", decomposer_node)
workflow.add_node("scheduler", scheduler_node)

workflow.add_conditional_edges(START, route_to_planner)
workflow.add_edge("decomposer", "scheduler")
workflow.add_edge("scheduler", END)

app_graph = workflow.compile()