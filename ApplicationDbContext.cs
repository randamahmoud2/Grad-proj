using Microsoft.EntityFrameworkCore;
using ToothToneAPI.Models;

namespace ToothToneAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Patient> Patients { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<PatientActivity> PatientActivities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Patient entity
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.DateOfBirth).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Active");
                entity.Property(e => e.BloodType).HasMaxLength(10);
                entity.Property(e => e.PrimaryDoctor).HasMaxLength(100);
                entity.Property(e => e.Gender).HasMaxLength(20);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });

            // Configure Doctor entity
            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Specialty).HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });

            // Configure Appointment entity
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PatientId).IsRequired();
                entity.Property(e => e.DoctorId).IsRequired();
                entity.Property(e => e.AppointmentDate).IsRequired();
                entity.Property(e => e.AppointmentTime).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Scheduled");
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                // Configure relationships
                entity.HasOne(e => e.Patient)
                    .WithMany()
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                    .WithMany()
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure PatientActivity entity
            modelBuilder.Entity<PatientActivity>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PatientId).IsRequired();
                entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.ActivityDate).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.RelatedEntityType).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

                // Configure relationship
                entity.HasOne(e => e.Patient)
                    .WithMany()
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Seed some sample data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Doctors
            modelBuilder.Entity<Doctor>().HasData(
                new Doctor { Id = 1, Name = "Dr. Sarah Wilson", Specialty = "Primary Care", PhoneNumber = "123-456-7890", Email = "sarah.wilson@toothtone.com" },
                new Doctor { Id = 2, Name = "Dr. Michael Chen", Specialty = "Cardiology", PhoneNumber = "123-456-7891", Email = "michael.chen@toothtone.com" },
                new Doctor { Id = 3, Name = "Dr. Emily Johnson", Specialty = "Dermatology", PhoneNumber = "123-456-7892", Email = "emily.johnson@toothtone.com" }
            );

            // Seed Patients
            modelBuilder.Entity<Patient>().HasData(
                new Patient 
                { 
                    Id = 1, 
                    Name = "John Patel", 
                    DateOfBirth = new DateTime(1985, 5, 12), 
                    Status = "Active", 
                    BloodType = "A+", 
                    PrimaryDoctor = "Dr. Sarah Wilson",
                    Gender = "Male",
                    PhoneNumber = "123-456-7893",
                    Address = "123 Main St, City, State",
                    Email = "john.patel@email.com"
                }
            );

            // Seed Appointments
            modelBuilder.Entity<Appointment>().HasData(
                new Appointment 
                { 
                    Id = 1, 
                    PatientId = 1, 
                    DoctorId = 1, 
                    AppointmentDate = new DateTime(2025, 5, 24), 
                    AppointmentTime = new TimeSpan(10, 30, 0), 
                    Status = "Cancelled",
                    Notes = "Patient requested cancellation"
                },
                new Appointment 
                { 
                    Id = 2, 
                    PatientId = 1, 
                    DoctorId = 2, 
                    AppointmentDate = new DateTime(2025, 6, 12), 
                    AppointmentTime = new TimeSpan(14, 0, 0), 
                    Status = "Upcoming",
                    Notes = "Regular checkup"
                },
                new Appointment 
                { 
                    Id = 3, 
                    PatientId = 1, 
                    DoctorId = 3, 
                    AppointmentDate = new DateTime(2025, 5, 2), 
                    AppointmentTime = new TimeSpan(9, 15, 0), 
                    Status = "Completed",
                    Notes = "Skin examination completed"
                }
            );

            // Seed Patient Activities
            modelBuilder.Entity<PatientActivity>().HasData(
                new PatientActivity 
                { 
                    Id = 1, 
                    PatientId = 1, 
                    Type = "Appointment", 
                    Status = "completed", 
                    ActivityDate = new DateTime(2025, 5, 2, 9, 15, 0), 
                    Description = "Appointment with Dr. Sarah Wilson - Primary Care",
                    RelatedEntityId = 3,
                    RelatedEntityType = "Appointment"
                },
                new PatientActivity 
                { 
                    Id = 2, 
                    PatientId = 1, 
                    Type = "Lab results", 
                    Status = "received", 
                    ActivityDate = new DateTime(2025, 5, 1, 14, 30, 0), 
                    Description = "Blood work panel - Within normal ranges",
                    RelatedEntityId = null,
                    RelatedEntityType = "Lab"
                },
                new PatientActivity 
                { 
                    Id = 3, 
                    PatientId = 1, 
                    Type = "Message", 
                    Status = "from Dr. Wilson", 
                    ActivityDate = new DateTime(2025, 5, 1, 11, 5, 0), 
                    Description = "Regarding your recent lab results",
                    RelatedEntityId = null,
                    RelatedEntityType = "Message"
                }
            );
        }
    }
} 