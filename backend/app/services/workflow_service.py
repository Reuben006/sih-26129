from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.workflow import Workflow, WorkflowStep
from app.models.department import Department

class WorkflowService:
    @staticmethod
    def get_all_workflows(db: Session) -> List[Workflow]:
        return db.query(Workflow).filter(Workflow.active == True).all()

    @staticmethod
    def get_workflow_by_code(db: Session, code: str) -> Optional[Workflow]:
        return db.query(Workflow).filter(Workflow.code == code, Workflow.active == True).first()

    @staticmethod
    def create_workflow(db: Session, name: str, code: str, description: str, department_codes: List[str]) -> Workflow:
        workflow = Workflow(name=name, code=code, description=description, active=True)
        db.add(workflow)
        db.flush()

        for idx, dept_code in enumerate(department_codes, start=1):
            dept = db.query(Department).filter(Department.code == dept_code).first()
            if dept:
                step = WorkflowStep(
                    workflow_id=workflow.id,
                    department_id=dept.id,
                    step_order=idx,
                    required=True
                )
                db.add(step)
        db.commit()
        db.refresh(workflow)
        return workflow
