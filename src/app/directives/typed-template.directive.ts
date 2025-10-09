import { Directive, Input } from '@angular/core';

// https://stackoverflow.com/a/68318283
@Directive({ selector: 'ng-template[typedTemplate]', standalone: true })
export class TypedTemplateDirective<TypeToken> {
  // how you tell the directive what the type should be
  @Input('typedTemplate')
  typeToken?: TypeToken;

  // this magic is how we tell Angular the context type for this directive, which then propagates down to the type of the template
  static ngTemplateContextGuard<TypeToken>(
    _dir: TypedTemplateDirective<TypeToken>,
    ctx: unknown,
  ): ctx is TypeToken {
    return true;
  }
}
