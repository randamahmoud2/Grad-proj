using System;
using System.Collections.Generic;

namespace ToothToneAPI.DTOs
{
    public class PatientInfoDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Status { get; set; }
        public string BloodType { get; set; }
        public string PrimaryDoctor { get; set; }
        public DateTime? NextAppointment { get; set; }
    }

    public class AppointmentDto
    {
        public int Id { get; set; }
        public string DoctorName { get; set; }
        public string Specialty { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
    }

    public class ActivityDto
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public DateTime ActivityDate { get; set; }
        public string Description { get; set; }
        public int? RelatedEntityId { get; set; }
        public string RelatedEntityType { get; set; }
    }

    public class DashboardSummaryDto
    {
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public int TotalAppointments { get; set; }
        public int UpcomingAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int RecentActivities { get; set; }
        public DateTime LastLoginDate { get; set; }
    }

    public class CreateActivityDto
    {
        public int PatientId { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public string Description { get; set; }
        public int? RelatedEntityId { get; set; }
        public string RelatedEntityType { get; set; }
    }
} 