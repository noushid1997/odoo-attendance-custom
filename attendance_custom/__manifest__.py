{
    'name': 'Attendance Custom',
    'version': '15.0.0.0.0',
    'category': 'Attendance',
    'description': """Attendance Custom""",
    "sequence": 1,
    'depends': ['base', 'hr_attendance', 'project'],

    'data': [
        'views/hr_attendance.xml'
    ],
    'qweb': [],
    'assets': {
        'web.assets_backend': [
            'attendance_custom/static/src/js/my_attendances.js',
        ],
        'web.assets_qweb': [
            'attendance_custom/static/src/xml/**/*',
        ],
    },
    'installable': True,
    'auto_install': False,
}