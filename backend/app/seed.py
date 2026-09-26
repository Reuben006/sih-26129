from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models import (
    User, UserRole,
    Department,
    Workflow, WorkflowStep
)

def seed_database():
    """Initializes standard baseline records for SIH PS129 demonstration."""
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Users (Citizen, Official, Admin)
        users_data = [
            {
                "name": "Swayam Dudhela",
                "email": "citizen@govconnect.in",
                "password": "Password123!",
                "role": UserRole.CITIZEN
            },
            {
                "name": "Officer Rajesh Sharma",
                "email": "official@govconnect.in",
                "password": "Password123!",
                "role": UserRole.OFFICIAL
            },
            {
                "name": "Admin Meera Verma",
                "email": "admin@govconnect.in",
                "password": "Password123!",
                "role": UserRole.ADMIN
            }
        ]

        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    name=u["name"],
                    email=u["email"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"]
                )
                db.add(user)
        db.commit()

        # 2. Seed Departments
        departments_data = [
            {
                "name": "Municipal Corporation (Trade & Health License)",
                "code": "MUNICIPALITY",
                "connector_type": "REST_JSON",
                "description": "Urban local body trade license and public health sanitation compliance",
                "active": True
            },
            {
                "name": "Food Safety and Standards Authority of India (FSSAI)",
                "code": "FSSAI",
                "connector_type": "FOSCOS_REST",
                "description": "Central food safety regulatory standards, premise hygiene and license issuing",
                "active": True
            },
            {
                "name": "Directorate of Fire & Emergency Services",
                "code": "FIRE",
                "connector_type": "NOC_REST",
                "description": "Life safety, fire mitigation, building occupancy clearance and NOC",
                "active": True
            },{
                "name": "GST & Tax Department",
                "code": "GST",
                "connector_type": "GSTN_REST",
                "description": "Business tax registration and GST compliance verification",
                "active": True
            },
            {
                "name": "Shops & Establishments Department",
                "code": "SHOPS",
                "connector_type": "LABOUR_REST",
                "description": "Establishment registration and labour compliance",
                "active": True
            }
        ]

        for d in departments_data:
            existing = db.query(Department).filter(Department.code == d["code"]).first()
            if not existing:
                dept = Department(
                    name=d["name"],
                    code=d["code"],
                    connector_type=d["connector_type"],
                    description=d["description"],
                    active=d["active"]
                )
                db.add(dept)
        db.commit()

        # 3. Seed Workflows
        wf_existing = db.query(Workflow).filter(Workflow.code == "RESTAURANT_APPROVAL").first()
        if not wf_existing:
            wf = Workflow(
                name="Restaurant Establishment Unified Clearance",
                code="RESTAURANT_APPROVAL",
                description="Sequential federated approval workflow: Municipality -> FSSAI -> Fire -> GST -> Shops & Establishments -> Final Clearance",
                active=True
            )
            db.add(wf)
            db.flush()

            # Link steps: 1. Municipality, 2. FSSAI, 3. Fire
            muni = db.query(Department).filter(Department.code == "MUNICIPALITY").first()
            fssai = db.query(Department).filter(Department.code == "FSSAI").first()
            fire = db.query(Department).filter(Department.code == "FIRE").first()
            gst = db.query(Department).filter(Department.code == "GST").first()
            shops = db.query(Department).filter(Department.code == "SHOPS").first()

            if muni and fssai and fire:
                s1 = WorkflowStep(workflow_id=wf.id, department_id=muni.id, step_order=1, required=True)
                s2 = WorkflowStep(workflow_id=wf.id, department_id=fssai.id, step_order=2, required=True)
                s3 = WorkflowStep(workflow_id=wf.id, department_id=fire.id, step_order=3, required=True)
                s4 = WorkflowStep(workflow_id=wf.id, department_id=gst.id, step_order=4, required=True)
                s5 = WorkflowStep(workflow_id=wf.id, department_id=shops.id, step_order=5, required=True)

                db.add_all([s1, s2, s3, s4, s5])

            db.commit()

        print("Database initialized and seeded successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
