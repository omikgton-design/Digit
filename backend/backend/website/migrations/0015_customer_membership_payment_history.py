from django.db import migrations, models
import django.db.models.deletion


def copy_customer_membership_dates(apps, schema_editor):
    Customer = apps.get_model("website", "Customer")
    CustomerMembershipPayment = apps.get_model("website", "CustomerMembershipPayment")

    customers = Customer.objects.exclude(membership_paid_date__isnull=True, membership_end_date__isnull=True)
    for customer in customers:
        CustomerMembershipPayment.objects.create(
            customer=customer,
            paid_date=customer.membership_paid_date,
            end_date=customer.membership_end_date,
            membership_type=customer.type,
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("website", "0014_customer_membership_dates"),
    ]

    operations = [
        migrations.CreateModel(
            name="CustomerMembershipPayment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("paid_date", models.DateField(blank=True, null=True)),
                ("end_date", models.DateField(blank=True, null=True)),
                ("membership_type", models.CharField(choices=[("gold", "Gold"), ("silver", "Silver"), ("bronze", "Bronze")], default="bronze", max_length=10)),
                ("created_date", models.DateTimeField(auto_now_add=True)),
                ("update_date", models.DateTimeField(auto_now=True)),
                ("customer", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="membership_payments", to="website.customer")),
            ],
            options={
                "ordering": ["-paid_date", "-id"],
            },
        ),
        migrations.RunPython(copy_customer_membership_dates, noop_reverse),
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(
                    model_name="customer",
                    name="membership_paid_date",
                ),
                migrations.RemoveField(
                    model_name="customer",
                    name="membership_end_date",
                ),
            ],
            database_operations=[],
        ),
    ]
