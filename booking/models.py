from django.contrib.auth.models import User
from django.db import models
from multiselectfield import MultiSelectField


# Create your models here.
class Owner(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=11, null=True, blank=True)

    def __str__(self):
        return f"{self.user} User#{self.user.id}"

class Pet(models.Model):
    SIZE_CHOICES = [
        ("S", "Pequeño (Hasta 14 kg)"),
        ("M", "Mediano (14 - 23 kg)"),
        ("L", "Grande (Sobre 23 kg)")
    ]
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name="owner")
    nombre = models.CharField(max_length=50)
    tamaño = models.CharField(
        max_length=20, choices=SIZE_CHOICES, default="")
    fecha_de_nacimiento = models.DateField(null=True, blank=True)
    raza = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre
 

class Appointment(models.Model):
    SERVICE_CHOICES = [
        ("Peluquería Express", "Peluquería Express"),
        ("Peluquería Completa", "Peluquería Completa"),
        ("Peluquería Premium Spa", "Peluquería Premium Spa")
    ]

    ADDONS_CHOICES = [
        ("Ninguno", "Ninguno"),
        ("Cepillado dental", "Cepillado dental"),
        ("Desenmatado", "Desenmatado"),
        ("Tratamiento facial", "Tratamiento facial"),
        ("Masaje corporal", "Masaje corporal"),
        ("Baño de hidromasaje", "Baño de hidromasaje"),
        ("Acondicionador de avena y aloe vera", "Acondicionador de avena y aloe vera"),
    ]

    TIME_CHOICES = [
        (10, "10:00 AM"),
        (13, "1:00 PM"),
        (15, "3:00 PM")
    ]

    user = models.ForeignKey(
        Owner, on_delete=models.CASCADE)
    dog = models.ForeignKey(
        Pet, on_delete=models.CASCADE, default="")
    date = models.DateField(default="", null=False) 
    time = models.IntegerField(choices=TIME_CHOICES, )
    service = models.CharField(max_length=40, choices=SERVICE_CHOICES, default="E")
    add_ons = MultiSelectField(
        choices=ADDONS_CHOICES, max_choices=6, max_length=50, default="")
    remarks = models.CharField(max_length=200, null = True, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('date', 'time')

    def __str__(self):
        return f"Ref#{self.id:05d} -{self.get_time_display()} on {self.date} for {self.dog}"

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.id,
            "dog": self.dog.nombre,
            "date": self.date.strftime("%b %#d %Y (%a)"),
            "time": self.get_time_display(),
            "service": self.get_service_display(),
            "add_ons": self.get_add_ons_display(),
            "add_ons_list": self.add_ons,
            "created": self.created.strftime("%b %#d %Y, %I:%M %p")
        }
    

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=800)
    approved = models.BooleanField(default=False)
    read = models.BooleanField(default=False)

    def __str__(self):
        if self.approved:
            return f'Approved - "{self.content}"'
        else:
            return f'Pending Approval - "{self.content}"'


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, null=True, blank=True)  # Agregado

    def __str__(self):
        return f"Notification for {self.user.usernombre} - {self.message[:30]}"

class Galeria(models.Model):
    title=models.CharField(max_length=41)
    description=models.TextField()
    image=models.ImageField()
    created=models.DateTimeField(auto_now_add=True)
    updated=models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name="Gallery"
        verbose_name_plural="Galleries"

    def __str__(self):
        return self.title  





