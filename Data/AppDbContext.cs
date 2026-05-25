using Microsoft.EntityFrameworkCore;
using UserManagementAPI.Models;
using UserManagementAPI.Services;

namespace UserManagementAPI.Data
{
    public class AppDbContext : DbContext
    {
        private readonly ICurrentUserService _currentUserService;

        public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService? currentUserService = null)
            : base(options)
        {
            _currentUserService = currentUserService ?? new SystemCurrentUserService();
        }

        public DbSet<User> Users { get; set; }
        public DbSet<AuthUser> AuthUsers { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
            modelBuilder.Entity<AuthUser>().HasQueryFilter(a => !a.IsDeleted);
            modelBuilder.Entity<UserProfile>().HasQueryFilter(p => !p.IsDeleted);

            modelBuilder.Entity<UserProfile>()
                .HasOne(p => p.User)
                .WithOne(u => u.Profile)
                .HasForeignKey<UserProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserProfile>()
                .HasIndex(p => p.UserId)
                .IsUnique();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplyAuditInfo();
            return await base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            ApplyAuditInfo();
            return base.SaveChanges();
        }

        private void ApplyAuditInfo()
        {
            var currentUser = _currentUserService.GetCurrentUserName();
            var utcNow = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries<BaseAuditableEntity>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedBy = currentUser;
                    entry.Entity.CreatedDate = utcNow;
                    entry.Entity.IsDeleted = false;
                }

                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedBy = currentUser;
                    entry.Entity.UpdatedDate = utcNow;
                }
            }
        }
    }
}
