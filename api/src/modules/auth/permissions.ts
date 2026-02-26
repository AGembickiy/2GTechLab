import { AuthenticationError, ForbiddenError } from "apollo-server-express";

export type ResolverFn = (parent: any, args: any, context: any, info: any) => any;

export function isAuthenticated(resolver: ResolverFn): ResolverFn {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new AuthenticationError("You must be logged in");
    }
    return resolver(parent, args, context, info);
  };
}

export function hasRole(roles: string[], resolver: ResolverFn): ResolverFn {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new AuthenticationError("You must be logged in");
    }
    const userRoles = context.user.roles || [];
    const hasRequiredRole = roles.some((role) => userRoles.includes(role));
    if (!hasRequiredRole) {
      throw new ForbiddenError("You do not have permission to perform this action");
    }
    return resolver(parent, args, context, info);
  };
}
