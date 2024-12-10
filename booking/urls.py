from . import views
from django.urls import path, register_converter
from .utilities import DateConverter

register_converter(DateConverter, 'date')

urlpatterns= [
    path('', views.inicio, name='inicio'),
    path('galeria', views.galeria,name="galeria"),
    path('services', views.services, name="services"),
    path('login', views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path('register', views.register, name="register"),
    path('changepassword', views.change_password, name="changepassword"),    
    path('profile',views.profile, name="profile"),
    path('booking', views.booking, name="booking"),
    path('appointment/<int:id>', views.appointment, name="appointment"),
    path('schedule/<date:start>/<str:move>', views.schedule, name="schedule"),
    path('mark-notification-read/<int:notification_id>/', views.mark_notification_read, name='mark_notification_read'),
    path('add_pet', views.add_pet, name="add_pet"),
    path('detalle-cita/<int:booking_id>/', views.detalle_cita, name='detalle_cita'),
    path('eliminar-cita/<int:appointment_id>/', views.cancel_booking, name='cancel_booking'),
    path('delete_pet/<int:pet_id>/', views.delete_pet, name='delete_pet'),
]
