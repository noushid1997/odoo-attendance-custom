from odoo import models, fields


class HREmployee(models.Model):
    _inherit = 'hr.employee'

    def _attendance_action_change(self):
        res = super(HREmployee, self)._attendance_action_change()
        if res and 'project' in self._context.keys() and 'task' in self._context.keys():
            project = self._context['project']
            task = self._context['task']
            res.write({
                'project_id': project,
                'task_id': task
            })
        if res and 'desc' in self._context.keys():
            desc = self._context['desc']
            res.write({
                'description': desc,
            })
        return res


class HRAttendance(models.Model):
    _inherit = 'hr.attendance'

    project_id = fields.Many2one('project.project')
    task_id = fields.Many2one('project.task')
    description = fields.Text("Description")
