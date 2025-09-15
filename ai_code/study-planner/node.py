from structure import AgentState,Curriculum,StudySchedule
import streamlit as st
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

def decomposer_node(state: AgentState):

    api_key = os.getenv("GROQ_API_KEY")
    
    try:
        llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=api_key)
        structured_llm = llm.with_structured_output(Curriculum)
    except Exception as e:
        return {"error": f"Failed to initialize the language model: {e}"}

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are an expert curriculum designer. Your sole task is to take a user's high-level learning goal and break it down into a comprehensive and structured list of subjects and their specific topics. Do NOT create a schedule. The output MUST be in the requested `Curriculum` JSON format."),
        ("human", "My goal is: **{goal}**. My deadline is {end_date}. Please generate the detailed curriculum of subjects and topics I need to learn.")
    ])
    prompt = prompt_template.format(goal=state['goal'], end_date=state['end_date'])

    try:
        response = structured_llm.invoke(prompt)
        return {"curriculum": response}
    except Exception as e:
        return {"error": f"Curriculum generation failed: {e}"}


def scheduler_node(state: AgentState):

    api_key = os.getenv("GROQ_API_KEY")

    try:
        llm = ChatGroq(temperature=0.4, model_name="llama-3.3-70b-versatile", api_key=api_key)
        structured_llm = llm.with_structured_output(StudySchedule)
    except Exception as e:
        return {"error": f"Failed to initialize the language model: {e}"}

    curriculum_str = ""
    if state.get("curriculum"): 
        for subject in state["curriculum"].subjects:
            curriculum_str += f"\n### {subject.subject_name}\n"
            curriculum_str += "\n".join([f"- {topic}" for topic in subject.topics])
    elif state.get("subjects_with_topics"): 
        for subject in state["subjects_with_topics"]:
            curriculum_str += f"\n### {subject['name']}\n"
            curriculum_str += "\n".join([f"- {topic}" for topic in subject['topics']])

    time_constraint_prompt = ""
    if state.get("daily_study_hours"):
        time_constraint_prompt = f"The user has specified they can study for approximately {state['daily_study_hours']} hours per day. Please create a schedule that reflects this commitment."
    else:
        time_constraint_prompt = "Please estimate a realistic number of daily study hours (e.g., 3-5 hours) for the schedule."

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are an expert AI academic coach. Your task is to create a personalized, day-by-day study schedule from a pre-defined list of topics.

        **CRITICAL RULES:**
        1.  Your ONLY job is to schedule the topics provided. You MUST schedule EVERY topic.
        2.  Distribute the topics logically across the available days between {today_date} and the deadline, {end_date}.
        3.  {time_constraint}
        4.  Your final output MUST be a single, valid JSON object that strictly follows the `StudySchedule` format.
        """),
        ("human", """Here is the goal and the exact curriculum. Please create the final schedule.
        
        **Goal:** {goal}
        **Deadline:** {end_date}
        
        **Curriculum to Schedule:**
        {curriculum}
        
        Generate the complete `StudySchedule` now.
        """)
    ])
    prompt = prompt_template.format(
        today_date=datetime.date.today().strftime("%A, %B %d, %Y"),
        end_date=state['end_date'],
        goal=state['goal'],
        curriculum=curriculum_str,
        time_constraint=time_constraint_prompt
    )

    try:
        response = structured_llm.invoke(prompt)
        return {"plan": response}
    except Exception as e:
        return {"error": f"Scheduling failed: {e}"}


def route_to_planner(state: AgentState):
    
    if state.get("plan_type") == "AI Autonomous Plan":
        return "decomposer"
    elif state.get("plan_type") == "Personalized Custom Plan":
        return "scheduler"