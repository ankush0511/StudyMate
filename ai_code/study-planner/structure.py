
from pydantic import BaseModel, Field
from typing import List, TypedDict, Optional

class Subject(BaseModel):
    subject_name: str = Field(description="The name of the subject, e.g., 'Data Structures & Algorithms'.")
    topics: List[str] = Field(description="A detailed list of specific topics to be studied for this subject.")

class Curriculum(BaseModel):
    subjects: List[Subject] = Field(description="The list of all subjects required to achieve the user's goal.")

class DayPlan(BaseModel):
    day: int = Field(description="The day number in the plan (e.g., 1, 2, 3).")
    date: str = Field(description="The specific date for this day's plan, e.g., 'Monday, August 04, 2025'.")
    topics_to_study: str = Field(description="The specific topics to be covered this day. Be concise, clear, and actionable.")
    time_allocation_hours: float = Field(description="The estimated number of hours to spend on this day's tasks.")

class StudySchedule(BaseModel):
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