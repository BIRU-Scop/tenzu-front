import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { AuthService } from "@tenzu/data/auth";
import { ProjectInvitationInfo } from "@tenzu/data/workspace";
import { ProjectService } from "@tenzu/data/project";
import { NotificationService } from "@tenzu/utils/services";

export const ProjectInvitationGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const projectService = inject(ProjectService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  const token = route.params["token"] as string;

  return projectService.getProjectInvitationInfo(token).pipe(
    switchMap((invitation: ProjectInvitationInfo) =>
      authService.isLoginOk().pipe(
        switchMap((logged) => {
          if (logged) {
            return projectService.acceptInvitation(token).pipe(
              map((invitAccept) =>
                router.parseUrl(`/workspace/${invitAccept.workspaceId}/project/${invitAccept.project.id}/kanban/main`),
              ),
              catchError((err) => {
                notificationService.error({ title: err });
                return of(false);
              }),
            );
          } else {
            if (invitation.existingUser) {
              const urlTree = router.parseUrl("/login");
              urlTree.queryParams = {
                next: `/accept-project-invitation/${token}`,
              };
              return of(urlTree);
            } else {
              const urlTree = router.parseUrl("/signup");
              urlTree.queryParams = {
                email: invitation.email,
                acceptProjectInvitation: true,
                projectInvitationToken: token,
              };
              return of(urlTree);
            }
          }
        }),
      ),
    ),
    catchError(() => {
      // Handle error when getting invitation details fails
      return authService.isLoginOk().pipe(map((logged) => (logged ? router.parseUrl("/") : router.parseUrl("/login"))));
    }),
  );
};
