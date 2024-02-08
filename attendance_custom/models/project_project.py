from odoo import models


class Project(models.Model):
    _inherit = 'project.project'

    def get_project_details(self):
        project_ids = self.env['project.project'].search([])
        project_vals = []
        for project in project_ids:
            vals = {
                'id': project.id,
                'name': project.name
            }
            project_vals.append(vals)
        return project_vals


class ProjectTask(models.Model):
    _inherit = 'project.task'

    def get_task_details(self, project):
        task_ids = self.env['project.task'].search([('project_id', '=', int(project))])
        task_vals = []
        for task in task_ids:
            vals = {
                'id': task.id,
                'name': task.name
            }
            task_vals.append(vals)
        return task_vals
