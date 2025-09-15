import streamlit as st
import datetime
import os
from collections import deque
from dotenv import load_dotenv

load_dotenv()


from langgraph.graph import StateGraph, START, END
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from typing import List, TypedDict, Optional


class Subject(BaseModel):
    """A subject with a list of its specific topics."""
    subject_name: str = Field(description="The name of the subject, e.g., 'Data Structures & Algorithms'.")
    topics: List[str] = Field(description="A detailed list of specific topics to be studied for this subject.")

class Curriculum(BaseModel):
    """The complete curriculum broken down into subjects and topics."""
    subjects: List[Subject] = Field(description="The list of all subjects required to achieve the user's goal.")

class DayPlan(BaseModel):
    """A single day's plan in the study schedule."""
    day: int = Field(description="The day number in the plan (e.g., 1, 2, 3).")
    date: str = Field(description="The specific date for this day's plan, e.g., 'Monday, August 04, 2025'.")
    topics_to_study: str = Field(description="The specific topics to be covered this day. Be concise, clear, and actionable.")
    time_allocation_hours: float = Field(description="The estimated number of hours to spend on this day's tasks.")

class StudySchedule(BaseModel):
    """The complete, structured study schedule."""
    plan_title: str = Field(description="A motivational and descriptive title for the overall study plan.")
    schedule: List[DayPlan] = Field(description="The list of daily plans.")
    summary: str = Field(description="A brief, encouraging summary of the plan, highlighting the daily commitment and key focus areas.")

class AgentState(TypedDict):
    plan_type: str
    goal: str
    end_date: str
    subjects_with_topics: Optional[List[dict]] = None
    daily_study_hours: Optional[float] = None
    curriculum: Optional[Curriculum] = None
    plan: Optional[StudySchedule] = None
    error: Optional[str] = None

def decomposer_node(state: AgentState):
    """
    Agent 1: Decomposes a high-level goal into a structured curriculum.
    This node only runs for the 'AI Autonomous Plan'.
    """
    st.write("🤖 **Agent 1: Curriculum Designer** is analyzing your goal...")
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
    """
    Agent 2: Takes a curriculum (either AI-generated or user-provided) and creates a schedule.
    """
    st.write("📅 **Agent 2: Scheduler** is building your timetable...")
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
        st.write("Timetable generated!")
        return {"plan": response}
    except Exception as e:
        return {"error": f"Scheduling failed: {e}"}

def route_to_planner(state: AgentState):
    """
    This function decides the next step based on the plan type.
    """
    if state.get("plan_type") == "AI Autonomous Plan":
        return "decomposer"
    elif state.get("plan_type") == "Personalized Custom Plan":
        return "scheduler"

workflow = StateGraph(AgentState)
workflow.add_node("decomposer", decomposer_node)
workflow.add_node("scheduler", scheduler_node)
workflow.add_conditional_edges(START, route_to_planner)
workflow.add_edge("decomposer", "scheduler")
workflow.add_edge("scheduler", END)
app_graph = workflow.compile()




st.set_page_config(page_title="Synapse AI Study Planner", page_icon="🧠", layout="wide")

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    .stApp { font-family: 'Inter', sans-serif; }
    h1, h2, h3 { font-weight: 700; color: var(--primary-color); }
    .stButton>button {
        background-color: var(--primary-color); color: #FFFFFF;
        border-radius: 8px; border: none; padding: 12px 24px;
        font-size: 16px; font-weight: 600; width: 100%;
        transition: all 0.2s ease-in-out;
    }
    .stButton>button:hover { filter: brightness(1.1); }
    .summary-card {
        background: var(--secondary-background-color);
        border-radius: 12px; padding: 25px; margin-bottom: 20px;
        border-left: 6px solid var(--primary-color);
    }
</style>
""", unsafe_allow_html=True)

st.title("Hybrid AI Study Planner")

if 'subjects' not in st.session_state:
    st.session_state.subjects = []

# --- Main Input Area ---
plan_type = st.radio(
    "**Select Your Plan Type**",
    ("AI Autonomous Plan", "Personalized Custom Plan"),
    horizontal=True,
    help="Choose 'AI Autonomous' for general goals where the AI defines the topics. Choose 'Personalized Custom' to provide your own specific topics and study hours."
)

st.header("1. Define Your Goal")
goal = st.text_input("What is your study goal?", placeholder="e.g., 'Prepare for GATE Exam' or 'My College Finals'")
end_date = st.date_input("What is your target date?", min_value=datetime.date.today())

if plan_type == "Personalized Custom Plan":
    st.header("2. Enter Your Custom Details")
    daily_hours = st.number_input("How many hours can you study per day?", min_value=1.0, max_value=16.0, value=3.0, step=0.5)
    
    with st.form("add_subject_form", clear_on_submit=True):
        st.subheader("Add Your Subjects & Topics")
        subject_name = st.text_input("Subject Name", placeholder="e.g., Data Structures")
        topics_text = st.text_area("Topics (one per line)", placeholder="Arrays\nLinked Lists\nTrees")
        add_button = st.form_submit_button("Add Subject")

        if add_button and subject_name and topics_text:
            topics = [topic.strip() for topic in topics_text.split('\n') if topic.strip()]
            st.session_state.subjects.append({"name": subject_name, "topics": topics})

    if st.session_state.subjects:
        st.subheader("Your Custom Syllabus:")
        for i, subject in enumerate(st.session_state.subjects):
            with st.expander(f"**{subject['name']}** ({len(subject['topics'])} topics)"):
                st.write(subject['topics'])
                if st.button("Remove", key=f"remove_{i}"):
                    st.session_state.subjects.pop(i)
                    st.rerun()

st.header("3. Generate Your Plan")
if st.button("Generate My AI Plan"):
    is_valid = True
    if not goal:
        st.error("Please enter a goal to get started.")
        is_valid = False
    if plan_type == "Personalized Custom Plan" and not st.session_state.subjects:
        st.error("Please add at least one subject and its topics for a personalized plan.")
        is_valid = False

    if is_valid:
        with st.status("Synapse AI is thinking...", expanded=True) as status:
            initial_state = {
                "plan_type": plan_type,
                "goal": goal,
                "end_date": end_date.strftime("%A, %B %d, %Y"),
            }
            if plan_type == "Personalized Custom Plan":
                initial_state["subjects_with_topics"] = st.session_state.subjects
                initial_state["daily_study_hours"] = daily_hours

            final_state = app_graph.invoke(initial_state)

            if final_state.get("error"):
                status.update(label="Error!", state="error", expanded=True)
                st.error(f"An error occurred: {final_state['error']}")
            elif final_state.get("plan"):
                status.update(label="Plan Generated!", state="complete", expanded=False)
                # st.balloons()
                plan_data = final_state["plan"]
                
                st.header("Your Personalized AI Study Plan is Ready!")
                st.markdown(f"""
                <div class="summary-card">
                    <h3>{plan_data.plan_title}</h3>
                    <p><strong>Summary:</strong> <em>{plan_data.summary}</em></p>
                </div>
                """, unsafe_allow_html=True)

                st.subheader("🗓️ Your Daily Breakdown")
                schedule_list = plan_data.schedule
                if schedule_list:
                    display_df = [
                        {
                            "Day": item.day, "Date": item.date,
                            "Topic(s) to Study": item.topics_to_study,
                            "Time (Hours)": f"{item.time_allocation_hours:.1f}"
                        } for item in schedule_list
                    ]
                    st.dataframe(display_df, use_container_width=True, hide_index=True)
            else:
                status.update(label="Error!", state="error", expanded=True)
                st.error("Something went wrong. The AI did not return a final plan.")
else:
    st.info("Define your goal and deadline, then click the button to generate your personalized plan.")

