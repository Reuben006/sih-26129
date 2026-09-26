import asyncio
import json
from app.core.database import SessionLocal, Base, engine
from app.seed import seed_database
from app.models.user import User
from app.schemas.application import ApplicationCreate
from app.services.application_service import ApplicationService
from app.workflow.engine import WorkflowEngine
from app.models.application import DepartmentStatus, OverallStatus

async def test_full_demo_flow():
    print("\n==========================================")
    print("STARTING GOVCONNECT PS129 FULL DEMO FLOW")
    print("==========================================\n")
    
    # 1. Ensure DB and Seed
    Base.metadata.create_all(bind=engine)
    seed_database()
    db = SessionLocal()

    # Step 1: Citizen Login / Retrieve
    citizen = db.query(User).filter(User.email == "citizen@govconnect.in").first()
    official = db.query(User).filter(User.email == "official@govconnect.in").first()
    print(f"[Step 1] Citizen logged in: {citizen.name} ({citizen.email})")

    # Clean existing test apps for pristine run
    for app in citizen.applications:
        db.delete(app)
    db.commit()

    # Step 2: Citizen Submits Restaurant Establishment Application (Common Data ONCE)
    app_data = ApplicationCreate(
        business_name="ABC Restaurant",
        owner_name="Swayam Dudhela",
        address="Shop 12, High Street, Bandra West, Mumbai 400050",
        pan="ABCDE1234F",
        mobile="9876543210",
        seating_capacity=60,
        building_area_sqft=1400,
        grant_consent=True
    )
    print(f"\n[Step 2] Citizen submitting Common Canonical Data ONCE:")
    print(json.dumps(app_data.model_dump(), indent=2))

    # Steps 3-8: Validate, Create APP-1001, Determine Workflow, Transform, Dispatch Municipality
    success, app1, msg = await ApplicationService.create_application(db, app_data, citizen)
    assert success, f"Application creation failed: {msg}"
    print(f"\n[Step 3 & 4] Validated data and created Unified Application Number: {app1.application_number}")
    print(f"[Step 5] Workflow Engine activated: Municipality -> FSSAI -> Fire -> GST -> Shops & Establishments")


    db.refresh(app1)
    muni_status = next(s for s in app1.department_statuses if s.department.code == "MUNICIPALITY")
    print(f"[Step 6] Transformed Canonical Data to Municipal Schema:")
    print(json.dumps(muni_status.request_payload, indent=2))
    print(f"[Step 7 & 8] Submitted to Municipality Connector. External Reference: {muni_status.external_reference}")
    print(f"[Step 9] Unified Application Status: {app1.overall_status.value}")

    # Step 10: Municipality Approves
    print(f"\n[Step 10] Official reviews & APPROVES Municipal Corporation Stage...")
    success, msg, _ = await WorkflowEngine.process_department_decision(
        db=db,
        application_id=app1.id,
        department_id=muni_status.department_id,
        decision_status=DepartmentStatus.APPROVED,
        remarks="Ward inspection verified health and trade compliance",
        officer_user_id=official.id
    )
    db.refresh(app1)
    print(f"Outcome: {msg}")

    # Step 11: Workflow Automatically Moves to FSSAI
    fssai_status = next(s for s in app1.department_statuses if s.department.code == "FSSAI")
    print(f"\n[Step 11] Workflow Engine automatically advanced to FSSAI (Stage 2)!")
    print(f"Transformed to FSSAI FoSCoS Schema:")
    print(json.dumps(fssai_status.request_payload, indent=2))
    print(f"FSSAI External Reference: {fssai_status.external_reference}")

    # Step 12: FSSAI Approves
    print(f"\n[Step 12] Official reviews & APPROVES FSSAI Stage...")
    success, msg, _ = await WorkflowEngine.process_department_decision(
        db=db,
        application_id=app1.id,
        department_id=fssai_status.department_id,
        decision_status=DepartmentStatus.APPROVED,
        remarks="Food business operator hygiene standards verified",
        officer_user_id=official.id
    )
    db.refresh(app1)
    print(f"Outcome: {msg}")

    # Step 13: Workflow Advances to Fire Department, then Fire Department Rejects
    fire_status = next(s for s in app1.department_statuses if s.department.code == "FIRE")
    print(f"\n[Step 13] Workflow Engine advanced to Fire & Emergency Services (Stage 3)!")
    print(f"Transformed to Fire NOC Schema:")
    print(json.dumps(fire_status.request_payload, indent=2))
    print(f"Fire External Reference: {fire_status.external_reference}")

    print(f"\n[Step 13b] Fire Department REJECTS due to insufficient emergency egress width...")
    success, msg, _ = await WorkflowEngine.process_department_decision(
        db=db,
        application_id=app1.id,
        department_id=fire_status.department_id,
        decision_status=DepartmentStatus.REJECTED,
        remarks="Emergency exit corridor does not meet 2.5m minimum width statutory fire requirement",
        officer_user_id=official.id
    )
    db.refresh(app1)
    print(f"Outcome: {msg}")

    # Step 14: Application becomes REJECTED
    print(f"\n[Step 14] Overall Application Status: {app1.overall_status.value}")
    assert app1.overall_status == OverallStatus.REJECTED, "Expected REJECTED overall status"

    # Notifications check
    notifs = citizen.notifications
    print(f"Citizen received {len(notifs)} event notifications:")
    for n in notifs[:3]:
        print(f"  - [{n.type}] {n.title}: {n.message}")

    # DEMO PART B: All five departments approve -> Final APPROVED

    print("\n-----------------------------------------------------------")
    print("DEMO PART B: Full End-to-End Approval (All Departments Pass)")
    print("-----------------------------------------------------------")
    app_data_2 = ApplicationCreate(
        business_name="Grand Heritage Palace Restaurant",
        owner_name="Swayam Dudhela",
        address="Plot 88, Marine Drive, Nariman Point, Mumbai 400021",
        pan="ABCDE1234F",
        mobile="9876543210",
        seating_capacity=100,
        building_area_sqft=3200,
        grant_consent=True
    )
    success, app2, _ = await ApplicationService.create_application(db, app_data_2, citizen)
    print(f"Created Application {app2.application_number} for {app2.business_name}")

    # Approve Municipality
    muni2 = next(s for s in app2.department_statuses if s.department.code == "MUNICIPALITY")
    await WorkflowEngine.process_department_decision(
        db=db, application_id=app2.id, department_id=muni2.department_id,
        decision_status=DepartmentStatus.APPROVED, remarks="Trade License Approved"
    )
    db.refresh(app2)

    # Approve FSSAI
    fssai2 = next(s for s in app2.department_statuses if s.department.code == "FSSAI")
    await WorkflowEngine.process_department_decision(
        db=db, application_id=app2.id, department_id=fssai2.department_id,
        decision_status=DepartmentStatus.APPROVED, remarks="FSSAI License Approved"
    )
    db.refresh(app2)

    # Approve Fire
    fire2 = next(s for s in app2.department_statuses if s.department.code == "FIRE")
    await WorkflowEngine.process_department_decision(
        db=db, application_id=app2.id, department_id=fire2.department_id,
        decision_status=DepartmentStatus.APPROVED, remarks="Fire NOC Approved"
    )
    db.refresh(app2)

    # Approve GST
    gst2 = next(
        s for s in app2.department_statuses
        if s.department.code == "GST"
    )

    await WorkflowEngine.process_department_decision(
        db=db,
        application_id=app2.id,
        department_id=gst2.department_id,
        decision_status=DepartmentStatus.APPROVED,
        remarks="GST Registration Approved"
    )

    db.refresh(app2)

    # Approve Shops & Establishments
    shops2 = next(
        s for s in app2.department_statuses
        if s.department.code == "SHOPS"
    )

    await WorkflowEngine.process_department_decision(
        db=db,
        application_id=app2.id,
        department_id=shops2.department_id,
        decision_status=DepartmentStatus.APPROVED,
        remarks="Shops & Establishment Registration Approved"
    )

    db.refresh(app2)

    print(f"\nFinal Application {app2.application_number} Overall Status: {app2.overall_status.value}")
    assert app2.overall_status == OverallStatus.APPROVED, "Expected APPROVED overall status"

    # Audit Trail verification
    audits = app2.audit_logs
    print(f"\nImmutable Audit Trail for {app2.application_number} ({len(audits)} events recorded):")
    for a in audits:
        print(f"  - [{a.timestamp.strftime('%H:%M:%S')}] {a.action} ({a.entity})")

    print("\n==========================================")
    print("ALL PS129 REQUIREMENTS & DEMO FLOWS PASSED PERFECTLY!")
    print("==========================================\n")
    db.close()

if __name__ == "__main__":
    asyncio.run(test_full_demo_flow())
