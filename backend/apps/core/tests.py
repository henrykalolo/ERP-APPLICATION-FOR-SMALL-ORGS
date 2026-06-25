from decimal import Decimal

from django.test import TestCase
from django.test import RequestFactory

from apps.core.views import dashboard_summary
from apps.finance.models import Invoice
from apps.hr.models import Employee
from apps.operations.models import Customer, Project
from apps.tenants.models import Tenant
from apps.users.models import User


class DashboardSummaryTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.tenant = Tenant.objects.create(name='Acme', slug='acme', schema_name='acme')
        self.user = User.objects.create_user(username='owner', email='owner@example.com', password='secret')

        self.customer = Customer.objects.create(
            tenant=self.tenant,
            created_by=self.user,
            name='Acme Customer',
            code='CUST-001',
            email='customer@example.com',
        )

        Employee.objects.create(
            tenant=self.tenant,
            created_by=self.user,
            user=self.user,
            employee_id='EMP-001',
            job_title='Manager',
            hire_date='2024-01-01',
            employment_status='active',
        )

        Project.objects.create(
            tenant=self.tenant,
            created_by=self.user,
            name='ERP rollout',
            code='PROJ-001',
            status='in_progress',
            priority='high',
        )

        Invoice.objects.create(
            tenant=self.tenant,
            created_by=self.user,
            invoice_number='INV-001',
            customer=self.customer,
            date='2024-06-10',
            due_date='2024-06-20',
            status='sent',
            subtotal=Decimal('100.00'),
            tax_amount=Decimal('16.00'),
            total_amount=Decimal('116.00'),
        )

        Invoice.objects.create(
            tenant=self.tenant,
            created_by=self.user,
            invoice_number='INV-002',
            customer=self.customer,
            date='2024-06-11',
            due_date='2024-06-21',
            status='paid',
            subtotal=Decimal('50.00'),
            tax_amount=Decimal('8.00'),
            total_amount=Decimal('58.00'),
        )

    def test_dashboard_summary_returns_tenant_scoped_counts(self):
        request = self.factory.get('/api/v1/dashboard/summary/')
        request.tenant = self.tenant

        response = dashboard_summary(request)

        self.assertEqual(response.status_code, 200)
        payload = response.data

        self.assertEqual(payload['employees'], 1)
        self.assertEqual(payload['projects'], 1)
        self.assertEqual(payload['pending_invoices'], 1)
        self.assertEqual(payload['total_revenue'], '174.00')
