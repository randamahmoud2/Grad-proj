using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ToothToneAPI.Data;
using ToothToneAPI.DTOs;
using ToothToneAPI.Models;

namespace ToothToneAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PatientDashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PatientDashboard/patient-info/{patientId}
        [HttpGet("patient-info/{patientId}")]
        public async Task<ActionResult<PatientInfoDto>> GetPatientInfo(int patientId)
        {
            try
            {
                var patient = await _context.Patients
                    .Where(p => p.Id == patientId)
                    .Select(p => new PatientInfoDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        DateOfBirth = p.DateOfBirth,
                        Status = p.Status,
                        BloodType = p.BloodType,
                        PrimaryDoctor = p.PrimaryDoctor,
                        NextAppointment = p.NextAppointment
                    })
                    .FirstOrDefaultAsync();

                if (patient == null)
                {
                    return NotFound("Patient not found");
                }

                return Ok(patient);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/PatientDashboard/appointments/{patientId}
        [HttpGet("appointments/{patientId}")]
        public async Task<ActionResult<List<AppointmentDto>>> GetPatientAppointments(int patientId)
        {
            try
            {
                var appointments = await _context.Appointments
                    .Where(a => a.PatientId == patientId)
                    .Include(a => a.Doctor)
                    .OrderByDescending(a => a.AppointmentDate)
                    .Select(a => new AppointmentDto
                    {
                        Id = a.Id,
                        DoctorName = a.Doctor.Name,
                        Specialty = a.Doctor.Specialty,
                        AppointmentDate = a.AppointmentDate,
                        AppointmentTime = a.AppointmentTime,
                        Status = a.Status,
                        Notes = a.Notes
                    })
                    .ToListAsync();

                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/PatientDashboard/activities/{patientId}
        [HttpGet("activities/{patientId}")]
        public async Task<ActionResult<List<ActivityDto>>> GetPatientActivities(int patientId)
        {
            try
            {
                var activities = await _context.PatientActivities
                    .Where(pa => pa.PatientId == patientId)
                    .OrderByDescending(pa => pa.ActivityDate)
                    .Select(pa => new ActivityDto
                    {
                        Id = pa.Id,
                        Type = pa.Type,
                        Status = pa.Status,
                        ActivityDate = pa.ActivityDate,
                        Description = pa.Description,
                        RelatedEntityId = pa.RelatedEntityId,
                        RelatedEntityType = pa.RelatedEntityType
                    })
                    .Take(10) // Get last 10 activities
                    .ToListAsync();

                return Ok(activities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/PatientDashboard/summary/{patientId}
        [HttpGet("summary/{patientId}")]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary(int patientId)
        {
            try
            {
                var patient = await _context.Patients
                    .Where(p => p.Id == patientId)
                    .FirstOrDefaultAsync();

                if (patient == null)
                {
                    return NotFound("Patient not found");
                }

                var totalAppointments = await _context.Appointments
                    .Where(a => a.PatientId == patientId)
                    .CountAsync();

                var upcomingAppointments = await _context.Appointments
                    .Where(a => a.PatientId == patientId && a.AppointmentDate >= DateTime.Today)
                    .CountAsync();

                var completedAppointments = await _context.Appointments
                    .Where(a => a.PatientId == patientId && a.Status == "Completed")
                    .CountAsync();

                var recentActivities = await _context.PatientActivities
                    .Where(pa => pa.PatientId == patientId)
                    .CountAsync();

                var summary = new DashboardSummaryDto
                {
                    PatientId = patientId,
                    PatientName = patient.Name,
                    TotalAppointments = totalAppointments,
                    UpcomingAppointments = upcomingAppointments,
                    CompletedAppointments = completedAppointments,
                    RecentActivities = recentActivities,
                    LastLoginDate = DateTime.Now
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/PatientDashboard/record-activity
        [HttpPost("record-activity")]
        public async Task<ActionResult> RecordActivity([FromBody] CreateActivityDto activityDto)
        {
            try
            {
                var activity = new PatientActivity
                {
                    PatientId = activityDto.PatientId,
                    Type = activityDto.Type,
                    Status = activityDto.Status,
                    ActivityDate = DateTime.Now,
                    Description = activityDto.Description,
                    RelatedEntityId = activityDto.RelatedEntityId,
                    RelatedEntityType = activityDto.RelatedEntityType
                };

                _context.PatientActivities.Add(activity);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Activity recorded successfully", activityId = activity.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 