using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToothToneAPI.Models
{
    public class Patient
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [Required]
        public DateTime DateOfBirth { get; set; }
        
        [StringLength(50)]
        public string Status { get; set; } = "Active";
        
        [StringLength(10)]
        public string BloodType { get; set; }
        
        [StringLength(100)]
        public string PrimaryDoctor { get; set; }
        
        public DateTime? NextAppointment { get; set; }
        
        [StringLength(20)]
        public string Gender { get; set; }
        
        [StringLength(20)]
        public string PhoneNumber { get; set; }
        
        [StringLength(200)]
        public string Address { get; set; }
        
        [StringLength(100)]
        public string Email { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }

    public class Appointment
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int PatientId { get; set; }
        
        [Required]
        public int DoctorId { get; set; }
        
        [Required]
        public DateTime AppointmentDate { get; set; }
        
        [Required]
        public TimeSpan AppointmentTime { get; set; }
        
        [StringLength(50)]
        public string Status { get; set; } = "Scheduled";
        
        [StringLength(500)]
        public string Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; }
        
        [ForeignKey("DoctorId")]
        public virtual Doctor Doctor { get; set; }
    }

    public class Doctor
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [StringLength(100)]
        public string Specialty { get; set; }
        
        [StringLength(20)]
        public string PhoneNumber { get; set; }
        
        [StringLength(100)]
        public string Email { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }

    public class PatientActivity
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int PatientId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Type { get; set; }
        
        [StringLength(50)]
        public string Status { get; set; }
        
        [Required]
        public DateTime ActivityDate { get; set; }
        
        [StringLength(500)]
        public string Description { get; set; }
        
        public int? RelatedEntityId { get; set; }
        
        [StringLength(50)]
        public string RelatedEntityType { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        // Navigation property
        [ForeignKey("PatientId")]
        public virtual Patient Patient { get; set; }
    }
} 